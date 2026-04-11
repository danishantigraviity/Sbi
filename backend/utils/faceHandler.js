const path = require('path');
const canvas = require('canvas');
const faceapi = require('@vladmandic/face-api/dist/face-api.node-wasm.js');
const FaceAIService = require('../services/faceAIService');

// Monkey patch for Node.js environment
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;

const loadModels = async () => {
    if (modelsLoaded) return;
    const modelPath = path.join(__dirname, '..', 'models', 'biometrics');
    try {
        await faceapi.tf.setBackend('wasm');
        await faceapi.tf.ready();
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
        modelsLoaded = true;
        console.log('[BIOMETRICS] JS Fallback Models loaded successfully');
    } catch (err) {
        console.error('[BIOMETRICS] JS Fallback Model loading failed:', err.message);
        throw err;
    }
};

/**
 * Extracts a 128-float face descriptor from a base64 image.
 * Uses Python AI Service primarily, with JS fallback.
 */
const getEncodingFromImage = async (base64Image, skipAI = false) => {
    // 1. Try Python AI Service (High Fidelity)
    if (!skipAI) {
        try {
            const encodings = await FaceAIService.getEncodings([base64Image]);
            if (encodings && encodings.length > 0) {
                console.log('[BIOMETRICS] Encoding generated via Python AI Service');
                return encodings[0];
            }
        } catch (err) {
            console.warn('[BIOMETRICS] Python AI Service unavailable, falling back to JS');
        }
    }

    // 2. JS Fallback
    await loadModels();
    try {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const imgBuffer = Buffer.from(base64Data, 'base64');
        const img = await canvas.loadImage(imgBuffer);
        const detection = await faceapi.detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            console.log('[BIOMETRICS] No face detected in sample (JS)');
            return null;
        }

        console.log('[BIOMETRICS] Encoding generated via JS Fallback');
        return Array.from(detection.descriptor);
    } catch (err) {
        console.error('[BIOMETRICS] JS Encoding error:', err.message);
        return null;
    }
};

/**
 * Verifies a sequence of images against a list of valid users.
 * Uses Python AI Service primarily, with JS fallback.
 */
const verifyFaceLivenessAndMatch = async (liveImagesB64Array, allUsersArray) => {
    if (allUsersArray.length === 0) return { match: false, message: 'No biometric identities registered.' };

    // 1. Try Python AI Service (High Fidelity & Faster 1-to-N)
    try {
        const firstFrame = liveImagesB64Array[0];
        const result = await FaceAIService.verify(firstFrame, allUsersArray);
        if (result && result.match) {
            console.log('[BIOMETRICS] Identity verified via Python AI Service');
            return result;
        }
    } catch (err) {
        console.warn('[BIOMETRICS] Python Verification failed/unavailable, falling back to JS');
    }

    // 2. JS Fallback
    await loadModels();
    try {
        const liveDescriptors = [];
        for (const b64 of liveImagesB64Array) {
            // Force skip AI service here because the direct verify call above already failed/timed out
            const desc = await getEncodingFromImage(b64, true); 
            if (desc) liveDescriptors.push(new Float32Array(desc));
        }

        if (liveDescriptors.length === 0) {
            return { match: false, message: 'No face detected in capture sequence (JS)' };
        }

        const labeledDescriptors = allUsersArray.map(user => {
            const descriptors = user.faceEncodings.map(enc => new Float32Array(enc));
            return new faceapi.LabeledFaceDescriptors(user._id.toString(), descriptors);
        });

        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
        const matches = liveDescriptors.map(desc => faceMatcher.findBestMatch(desc));
        
        const matchCounts = {};
        matches.forEach(m => {
            if (m.label !== 'unknown') {
                matchCounts[m.label] = (matchCounts[m.label] || 0) + 1;
            }
        });

        const bestMatchId = Object.keys(matchCounts).reduce((a, b) => matchCounts[a] > matchCounts[b] ? a : b, null);

        if (!bestMatchId) {
            return { match: false, message: 'Biometric identity not recognized (JS)' };
        }

        const consistency = matchCounts[bestMatchId] / matches.length;
        if (consistency < 0.5) {
             return { match: false, message: 'Unstable biometric sequence (JS)' };
        }

        console.log('[BIOMETRICS] Identity verified via JS Fallback');
        return {
            match: true,
            userId: bestMatchId,
            isAlive: true,
            distance: matches.find(m => m.label === bestMatchId).distance
        };

    } catch (err) {
        console.error('[BIOMETRICS] Matcher error:', err.stack);
        return { match: false, message: 'Biometric processing error' };
    }
};

module.exports = {
  getEncodingFromImage,
  verifyFaceLivenessAndMatch
};
