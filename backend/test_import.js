// test_import.js
console.log('1. Starting test...');
const express = require('express');
console.log('2. Express loaded');
const { Canvas } = require('canvas');
console.log('3. Canvas loaded');
const faceapi = require('@vladmandic/face-api');
console.log('4. Face API loaded');
const { getEncodingFromImage } = require('./utils/faceHandler');
console.log('5. Face Handler loaded');
const { faceLogin } = require('./controllers/faceController');
console.log('6. Face Controller loaded');
console.log('--- ALL MODULES LOADED SUCCESSFULLY ---');
