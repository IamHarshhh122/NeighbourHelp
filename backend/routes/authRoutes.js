const express = require('express');
const router = express.Router();
const passport = require('passport');
const { sendOtp, verifyOtp, login } = require('../controllers/authController');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);

// Google Authentication Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
    (req, res) => {
        res.redirect('http://localhost:5173/dashboard');
    }
);

module.exports = router;