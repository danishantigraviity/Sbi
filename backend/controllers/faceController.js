const User = require('../models/User');
const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');
const { getEncodingFromImage, verifyFaceLivenessAndMatch } = require('../utils/faceHandler');
const { calculateDistance, OFFICE_COORDS } = require('../utils/geo');
const { getEncodings } = require('../services/faceAIService');

/**
 * Checks if a user has biometric data enrolled.
 */
exports.checkEnrollment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ 
      enrolled: !!(user.faceEncodings && user.faceEncodings.length > 0),
      samples: user.faceEncodings?.length || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Enrollment check failed' });
  }
};

exports.enrollFace = async (req, res) => {
  try {
    const { userId, images } = req.body; // Array of Base64 strings
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'Face samples are required for enrollment' });
    }

    const encodings = [];
    for (const imgB64 of images) {
      const encoding = await getEncodingFromImage(imgB64);
      if (encoding) encodings.push(encoding);
    }

    if (encodings.length === 0) {
      return res.status(400).json({ message: 'No faces detected in any samples' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.faceEncodings = encodings;
    await user.save();

    res.json({ success: true, message: `Successfully enrolled ${encodings.length} samples` });
  } catch (err) {
    console.error('Enrollment Error:', err.message);
    res.status(500).json({ message: 'Biometric processing failed' });
  }
};

exports.faceLogin = async (req, res) => {
  try {
    const { role, images, lat, lng } = req.body;

    // Strict Geo-fencing for Sellers
    if (role === 'seller') {
      if (!lat || !lng) {
        return res.status(400).json({ message: 'GPS location is required for Biometric Authentication' });
      }
      
      const distance = calculateDistance(lat, lng, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
      if (distance > 200 && process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ 
          message: `Biometric Denied. You are ${Math.round(distance)}m away from HQ. (Allowed: 200m)` 
        });
      } else if (distance > 200) {
        console.log(`[AUTH] Dev Mode: Bypassing Geo-fence (${Math.round(distance)}m)`);
      }
    }
    
    if (!images || !Array.isArray(images) || images.length < 1) {
      if (process.env.NODE_ENV === 'development' && req.body.bypass === true) {
        const user = await User.findOne({ role });
        if (user) {
          const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
          return res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
          });
        }
      }
      return res.status(400).json({ message: 'Liveness sequence (1 frame minimum) required' });
    }

    const allValidUsers = await User.find({ role, faceEncodings: { $exists: true, $not: { $size: 0 } } });
    if (allValidUsers.length === 0) {
       return res.status(404).json({ 
         message: 'Biometric login requires prior face enrollment. Please use password login or contact Admin.',
         type: 'NO_ENROLLMENT'
       });
    }

    console.log(`[BIOMETRICS] Matching face against ${allValidUsers.length} enrolled users...`);

    const result = await verifyFaceLivenessAndMatch(images, allValidUsers);

    if (!result.match) {
      // Strangers reject instantly.
      return res.status(401).json({ message: result.message || 'Face not recognized' });
    }

    // Identity Matched
    const user = await User.findById(result.userId);

    if (user.bioLockoutUntil && user.bioLockoutUntil > new Date()) {
      const remaining = Math.ceil((user.bioLockoutUntil - new Date()) / 1000 / 60);
      return res.status(403).json({ message: `Biometric login locked. Try again in ${remaining} minutes or use password.` });
    }

    if (!result.isAlive) {
      // Spoof detected! Same physical identity but dead/printed photo.
      user.bioLoginFailures += 1;
      if (user.bioLoginFailures >= 5) {
        user.bioLockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
        user.bioLoginFailures = 0;
      }
      await user.save();
      return res.status(401).json({ message: 'Liveness check failed. Blink and move slightly.' });
    }

    // Reset failures on success 
    user.bioLoginFailures = 0;
    user.bioLockoutUntil = null;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // Check-in attendance
    const today = new Date().toISOString().split('T')[0];
    let attendance = await Attendance.findOne({ sellerId: user._id, date: today });
    
    if (!attendance) {
      attendance = new Attendance({
        sellerId: user._id,
        checkIn: new Date(),
        date: today,
        checkInFaceVerified: true
      });
      await attendance.save();
    }

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Face Login Error:', err.message);
    res.status(500).json({ message: 'Biometric login failed' });
  }
};

exports.verifyFaceLogout = async (req, res) => {
  try {
    const { images, lat, lng } = req.body;

    // Strict Geo-fencing for Logout
    if (!lat || !lng) {
      return res.status(400).json({ message: 'GPS location is required for Duty Completion' });
    }
    
    const distance = calculateDistance(lat, lng, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
    if (distance > 200 && process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ 
        message: `Logout Blocked. You are ${Math.round(distance)}m away from HQ. (Allowed: 200m)` 
      });
    } else if (distance > 200) {
      console.log(`[AUTH] Dev Mode: Bypassing Geo-fence for Logout (${Math.round(distance)}m)`);
    }

    const user = await User.findById(req.user.id);

    if (!user || !user.faceEncodings || user.faceEncodings.length === 0) {
      return res.status(400).json({ message: 'Face verification missing' });
    }

    // Re-use 1-to-N matcher but restrict N to [user]
    const result = await verifyFaceLivenessAndMatch(images, [user]);

    if (!result.match) {
      return res.status(401).json({ message: 'Biometric verification failed' });
    }

    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ sellerId: user._id, date: today });

    if (attendance) {
      attendance.checkOut = new Date();
      attendance.checkOutFaceVerified = true;
      await attendance.save();
    }

    res.json({ success: true, message: 'Face verified successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logout verification error' });
  }
};
