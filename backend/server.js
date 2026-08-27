require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const nodemailer = require('nodemailer');
const cors = require('cors');
const User = require('./model/User'); 

const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'neighbourhelp',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch((err) => console.log('MongoDB Connection Error:', err.message));

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const otpStorage = {};

// 1. Send OTP Route
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, message: "Invalid email address!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage[email] = otp;

    const mailOptions = {
        from: `"NeighbourHelp" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your NeighbourHelp verification code',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Verification Code</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 16px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 420px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.08);">
                    <tr>
                      <td style="background-color: #0f172a; padding: 28px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 22px;">NeighbourHelp</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 36px 32px; text-align: center;">
                        <p style="color: #64748b; font-size: 14px; margin-bottom: 8px;">Security verification</p>
                        <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 24px;">Your one-time password</h2>
                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a;">${otp}</span>
                        </div>
                        <p style="color: #475569; font-size: 14px;">This code expires in <strong>5 minutes</strong>.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "OTP sent successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to send OTP!" });
    }
});

// 2. Verify OTP Route (With Database Save Fix)
app.post('/api/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (otpStorage[email] && otpStorage[email] === otp) {
        delete otpStorage[email];

        try {
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({ email, name: email.split('@')[0] });
            }
            res.status(200).json({ success: true, message: "Verified & logged in successfully!", user });
        } catch (dbErr) {
            console.error("Database error:", dbErr);
            res.status(500).json({ success: false, message: "Database error while saving user!" });
        }
    } else {
        res.status(400).json({ success: false, message: "Invalid or expired OTP!" });
    }
});

// Passport Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value
            });
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Auth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('http://localhost:5173/success');
    }
);

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});