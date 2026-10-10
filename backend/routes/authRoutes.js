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

// Jin-jin origins se login allow karna hai — localhost (dev) aur live Vercel (production)
// Dono yahan rahenge, kabhi conflict nahi hoga
const ALLOWED_CLIENT_ORIGINS = [
  "http://localhost:5173",
  "https://neighbour-help-mln9.vercel.app",
];

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.put("/users/home-location", saveHomeLocation);

// 1. Google Auth start: GET /api/google
// Frontend ab bataega ki wo kahan se request bhej raha hai (localhost ya live)
// taaki login ke baad wahin wapas bhej sakein
router.get("/google", (req, res, next) => {
  const requestedOrigin = stripSlash(req.query.redirect_uri || "");
  const safeOrigin = ALLOWED_CLIENT_ORIGINS.includes(requestedOrigin)
    ? requestedOrigin
    : CLIENT_URL;

  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    state: encodeURIComponent(safeOrigin), // ye origin callback tak carry hoga
  })(req, res, next);
});

// 2. Google Auth callback: GET /api/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/login?error=google_auth_failed`,
  }),
  (req, res) => {
    // state mein jo origin bheja tha wahi yahan wapas milega
    let redirectOrigin = CLIENT_URL;
    try {
      const decoded = decodeURIComponent(req.query.state || "");
      if (ALLOWED_CLIENT_ORIGINS.includes(decoded)) {
        redirectOrigin = decoded;
      }
    } catch (e) {
      // kuch galat mila to default (live) pe hi bhej denge, safe fallback
    }

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

    res.redirect(`${redirectOrigin}/oauth-success?user=${userData}`);
  }
);

module.exports = router;