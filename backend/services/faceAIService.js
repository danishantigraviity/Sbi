const axios = require('axios');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5002';

/**
 * Service to communicate with the Python-based Face AI Flask server.
 */
class FaceAIService {
    /**
     * Get face encodings (128D vectors) for an array of base64 images.
     */
    static async getEncodings(images) {
        try {
            const response = await axios.post(`${PYTHON_SERVICE_URL}/encode`, { images });
            if (response.data.success) {
                return response.data.encodings;
            }
            return null;
        } catch (err) {
            console.error('[FaceAI Service] Encoding failed:', err.message);
            return null;
        }
    }

    /**
     * Verify a live face against a list of valid users.
     */
    static async verify(liveImage, allUsers) {
        try {
            // Check each user
            for (const user of allUsers) {
                const response = await axios.post(`${PYTHON_SERVICE_URL}/verify`, {
                    image: liveImage,
                    storedEncodings: user.faceEncodings
                });

                if (response.data.match) {
                    return {
                        match: true,
                        userId: user._id,
                        isAlive: response.data.isAlive,
                        confidence: response.data.confidence
                    };
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
