require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cron = require("node-cron");

const User = require("./model/User");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const { autoConfirmExpiredTasks } = require("./routes/taskRoutes");

const stripSlash = (url) => (url || "").trim().replace(/\/+$/, "");

const isProduction =
  process.env.NODE_ENV === "production" || !!process.env.RENDER;

const CLIENT_URL = stripSlash(
  process.env.CLIENT_URL || "https://neighbour-help-mln9.vercel.app"
);

const BACKEND_URL = stripSlash(
  process.env.BACKEND_URL ||
    "https://neighbourhelp-backend.onrender.com"
);

const required = [
  "MONGO_URI",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  ...(isProduction ? ["SESSION_SECRET"] : []),
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(
    `Missing required environment variables: ${missing.join(", ")}`
  );
  process.exit(1);
}

const app = express();

app.set("trust proxy", 1);

app.use(express.json({ limit: "10mb" }));

const extraOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(stripSlash)
  .filter(Boolean);

const allowedOrigins = [
  ...new Set([
    CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...extraOrigins,
  ]),
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(stripSlash(origin))) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-only-session-secret",
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

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/google/callback`,
      proxy: true,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleEmail = profile.emails?.[0]?.value
          ?.toLowerCase()
          .trim();

        if (!googleEmail) {
          return done(
            new Error("Google account email not found"),
            null
          );
        }

        let user = await User.findOne({
          email: googleEmail,
        });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: googleEmail,
            name:
              profile.displayName ||
              googleEmail.split("@")[0],
            password: null,
            points: 20,
          });
        } else {
          let changed = false;

          if (!user.googleId) {
            user.googleId = profile.id;
            changed = true;
          }

          if (!user.name) {
            user.name =
              profile.displayName ||
              googleEmail.split("@")[0];
            changed = true;
          }

          if (changed) {
            await user.save();
          }
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

    // Auto-confirm tasks pending > 24 hr runs every 30 min
    cron.schedule("*/30 * * * *", async () => {
      await autoConfirmExpiredTasks();
    });
    console.log("Auto-confirm cron scheduled (every 30 min)");

    // Run once at startup too
    setTimeout(() => {
      autoConfirmExpiredTasks();
    }, 5000);
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error.message);
  });

app.use("/api", authRoutes);
app.use("/api", taskRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NeighbourHelp Backend is running!",
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);

  const status = err.message?.startsWith("CORS blocked")
    ? 403
    : 500;

  res.status(status).json({
    success: false,
    message: err.message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `Allowed CORS origins: ${allowedOrigins.join(", ")}`
  );
});