try {
    const canvas = require('canvas');
    console.log('[SUCCESS] Canvas loaded');
    const { Canvas, Image, ImageData } = canvas;
    console.log('[SUCCESS] Canvas properties extracted');
} catch (err) {
    console.error('[FAILURE] Canvas error:', err.message);
}

try {
    const faceapi = require('@vladmandic/face-api/dist/face-api.node.js');
    console.log('[SUCCESS] Face-api loaded');
} catch (err) {
    console.error('[FAILURE] Face-api error:', err.message);
}
