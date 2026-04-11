const axios = require('axios');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5002';

/**
 * Service to communicate with the Python-based Face AI Flask server.
 */
let aiServiceDown = false;

/**
 * Service to communicate with the Python-based Face AI Flask server.
 */
class FaceAIService {
    /**
     * Get face encodings (128D vectors) for an array of base64 images.
     */
    static async getEncodings(images) {
        if (aiServiceDown) return null;
        try {
            const response = await axios.post(`${PYTHON_SERVICE_URL}/encode`, { images }, { timeout: 2000 });
            if (response.data.success) {
                return response.data.encodings;
            }
            return null;
        } catch (err) {
            console.error('[FaceAI Service] Encoding failed:', err.message);
            if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
                aiServiceDown = true;
                console.warn('[FaceAI Service] Python AI server appears to be offline. Switching to local JS fallback.');
            }
            return null;
        }
    }

    /**
     * Verify a live face against a list of valid users.
     */
    static async verify(liveImage, allUsers) {
        if (aiServiceDown) return { match: false, message: 'AI Service offline' };
        
        try {
            // Check each user
            for (const user of allUsers) {
                try {
                    const response = await axios.post(`${PYTHON_SERVICE_URL}/verify`, {
                        image: liveImage,
                        storedEncodings: user.faceEncodings
                    }, { timeout: 1500 });

                    if (response.data.match) {
                        return {
                            match: true,
                            userId: user._id,
                            isAlive: response.data.isAlive,
                            confidence: response.data.confidence
                        };
                    }
                } catch (err) {
                    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
                        aiServiceDown = true;
                        throw new Error('AI Service unreachable');
                    }
                    continue; // Skip individual user errors
                }
            }

            return { match: false, message: 'Face not recognized' };
        } catch (err) {
            console.error('[FaceAI Service] Verification failed:', err.message);
            return { match: false, message: 'AI Service connection error' };
        }
    }
}

module.exports = FaceAIService;
