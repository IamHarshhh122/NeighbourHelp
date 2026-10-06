require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("./model/User");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
app.set("trust proxy", 1);

app.use(express.json());

// Dynamic Allowed Origins (Localhost + Live Vercel)
const allowedOrigins = [
  "http://localhost:5173",
  "https://neighbour-help-sandy.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); 
      }
    },
    credentials: true,
  })
);

const isProduction = process.env.NODE_ENV === "production" || !!process.env.RENDER;

app.use(
  session({
    secret: process.env.SESSION_SECRET || "neighbourhelp@7140",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Google Strategy with Dynamic Callback URL
const backendBaseUrl = process.env.BACKEND_URL || "https://neighbourhelp-backend.onrender.com";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${backendBaseUrl}/api/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleEmail = profile.emails?.[0]?.value?.toLowerCase().trim();

        if (!googleEmail) {
          return done(new Error("Google account email not found"), null);
        }

        let user = await User.findOne({ email: googleEmail });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: googleEmail,
            name: profile.displayName || googleEmail.split("@")[0],
            password: null,
            points: 20,
          });
        } else if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error("Google Strategy Error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully!");
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });

// Routes
app.use("/api", authRoutes);
app.use("/api", taskRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NeighbourHelp Backend is running!",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});