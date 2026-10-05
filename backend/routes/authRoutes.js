const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  sendOtp,
  verifyOtp,
  login,
  saveHomeLocation,
} = require("../controllers/authController");

const CLIENT_URL = process.env.CLIENT_URL || "https://neighbour-help-sandy.vercel.app";

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.put("/users/home-location", saveHomeLocation);

// 1. Google Auth Start Route 
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// 2. Google Auth Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login`,
  }),
  (req, res) => {
    const userData = encodeURIComponent(
      JSON.stringify({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        points: req.user.points || 20,
      })
    );
    res.redirect(`${CLIENT_URL}/?googleUser=${userData}`);
  }
);

module.exports = router;