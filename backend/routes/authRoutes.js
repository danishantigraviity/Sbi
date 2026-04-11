const express = require('express');
const { login, register } = require('../controllers/authController');
const { faceLogin, enrollFace, checkEnrollment } = require('../controllers/faceController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/face-login', faceLogin);
router.post('/enroll-face', auth, enrollFace);
router.get('/check-enrollment', auth, checkEnrollment);

module.exports = router;
