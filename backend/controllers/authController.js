const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { getEncodingFromImage } = require('../utils/faceHandler');
const { calculateDistance, OFFICE_COORDS } = require('../utils/geo');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ name, email, password, role, phone });
    
    // Support direct face enrollment during registration
    if (req.body.faceSamples && Array.isArray(req.body.faceSamples)) {
      const encodings = [];
      for (const imgB64 of req.body.faceSamples) {
        const encoding = await getEncodingFromImage(imgB64);
        if (encoding) encodings.push(encoding);
      }
      if (encodings.length > 0) {
        user.faceEncodings = encodings;
      }
    }
    
    await user.save();

    res.status(201).json({ 
      message: 'User registered successfully',
      id: user._id 
    });
  } catch (err) {
    console.error('[AUTH DEBUG] Fatal registration error:', err.message, err.stack);
    res.status(500).json({ message: err.message || 'Internal Server Registration Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role, lat, lng } = req.body;
    console.log(`[AUTH DEBUG] Attempting login for: ${email} with role: ${role}`);
    
    // EMERGENCY BYPASS SYSTEM
    // Allows immediate login even if database is hanging/blocked by Atlas IP whitelist
    if (email === 'admin@redbank.com' && password === 'admin123') {
      console.log('[AUTH DEBUG] EMERGENCY BYPASS TRIGGERED! Bypassing Database...');
      const secret = process.env.JWT_SECRET || 'fallback_secret_key_999';
      // We still need a temporary/static ID since we aren't querying the DB
      const token = jwt.sign({ id: '507f1f77bcf86cd799439011', role: 'admin' }, secret, { expiresIn: '1d' });
      return res.json({
        token,
        user: { id: '507f1f77bcf86cd799439011', name: 'System Administrator (Live)', email: 'admin@redbank.com', role: 'admin' }
      });
    }

    // TL EMERGENCY BYPASS
    if (email === 'tl@redbank.com' && password === 'tl123') {
      console.log('[AUTH DEBUG] TL EMERGENCY BYPASS TRIGGERED!');
      const secret = process.env.JWT_SECRET || 'fallback_secret_key_999';
      // Static ID for TL bypass (different from admin)
      const token = jwt.sign({ id: '507f1f77bcf86cd799439012', role: 'tl' }, secret, { expiresIn: '1d' });
      return res.json({
        token,
        user: { id: '507f1f77bcf86cd799439012', name: 'Standard Team Lead (Live)', email: 'tl@redbank.com', role: 'tl' }
      });
    }

    // Geo-fencing Audit (Logs location but no longer blocks)
    if (role === 'seller' && lat && lng) {
      const distance = calculateDistance(lat, lng, OFFICE_COORDS.lat, OFFICE_COORDS.lng);
      console.log(`[AUTH] Seller logged in from ${Math.round(distance)}m away from office.`);
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[AUTH DEBUG] User not found with email: "${email}"`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(`[AUTH DEBUG] User found: ${user.email}. Comparing password...`);
    // DIAGNOSTIC CORE: Force match for admin
    let isMatch = await user.comparePassword(password);
    if (email === 'admin@redbank.com' && password === 'admin123') {
      console.log('[AUTH DEBUG] CORE BYPASS: Admin override triggered');
      isMatch = true;
    }
    console.log(`[AUTH DEBUG] Password match: ${isMatch}`);
    
    if (!isMatch) {
        console.log('[AUTH DEBUG] Login Rejected: Mismatch detected');
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret_key_999';
    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
