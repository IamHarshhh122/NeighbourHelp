const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  sendOtp,
  verifyOtp,
  login,
  saveHomeLocation,
} = require("../controllers/authController");

// Live Vercel frontend (no trailing slash)
const CLIENT_URL = (
  process.env.CLIENT_URL || "https://neighbour-help-mln9.vercel.app"
)
  .trim()
  .replace(/\/+$/, "");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.put("/users/home-location", saveHomeLocation);

// 1. Google Auth start: GET /api/google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// 2. Google Auth callback: GET /api/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login?error=google_auth_failed`,
  }),
  (req, res) => {
    const userData = encodeURIComponent(
      JSON.stringify({
        _id: req.user._id,
        fullname: req.user.name,
        name: req.user.name,
        email: req.user.email,
        points: req.user.points ?? 20,
      })
    );

    res.redirect(`${CLIENT_URL}/oauth-success?user=${userData}`);
  }
);

module.exports = router;