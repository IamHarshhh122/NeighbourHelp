const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  sendOtp,
  verifyOtp,
  login,
  saveHomeLocation,
} = require("../controllers/authController");

const stripSlash = (url) => (url || "").trim().replace(/\/+$/, "");

const CLIENT_URL = stripSlash(
  process.env.CLIENT_URL || "https://neighbour-help-mln9.vercel.app"
);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.put("/users/home-location", saveHomeLocation);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login?error=google_auth_failed`,
  }),
  (req, res) => {
    const userData = encodeURIComponent(
      JSON.stringify({
        _id: req.user._id,
        id: req.user._id,
        fullname: req.user.name,
        name: req.user.name,
        email: req.user.email,
        points: req.user.points ?? 20,
        homeAddress: req.user.homeAddress || "",
        homeLat: req.user.homeLat ?? null,
        homeLng: req.user.homeLng ?? null,
      })
    );

    res.redirect(`${CLIENT_URL}/oauth-success?user=${userData}`);
  }
);

module.exports = router;