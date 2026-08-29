require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./model/User");
const Task = require("./model/Task");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:5173", credentials: true,
    })
);

// SESSION CONFIGURATION
app.use(
    session({
        secret: process.env.SESSION_SECRET || "neighbourhelp@7140",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

// PASSPORT INITIALIZATION
app.use(passport.initialize());
app.use(passport.session());

// GOOGLE OAUTH STRATEGY
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/api/google/callback",
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
                } else {
                    if (!user.googleId) {
                        user.googleId = profile.id;
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

// MONGODB CONNECTION
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error.message);
    });

// AUTH ROUTES
app.use("/api", authRoutes);

// ======================================================
// TASK ROUTES (CORRECTED URL PATHS)
// ======================================================

// 1. POST: Create a new task
app.post("/tasks", async (req, res) => {
    try {
        const { title, description, category, location, poster } = req.body;
        
        const newTask = await Task.create({
            title,
            description,
            category,
            location,
            poster,
            status: "Open"
        });

        const populatedTask = await Task.findById(newTask._id).populate("poster", "name points");
        res.status(201).json({ success: true, task: populatedTask });
    } catch (error) {
        console.error("Create Task Error:", error);
        res.status(500).json({ success: false, message: "Server error while creating task" });
    }
});

// 2. GET: Fetch nearby tasks
app.get("/tasks/nearby", async (req, res) => {
    try {
        const tasks = await Task.find({}).populate("poster", "name points");
        res.json({ success: true, count: tasks.length, tasks });
    } catch (error) {
        console.error("Nearby Tasks Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching tasks" });
    }
});

// 3. PUT: Accept a task
app.put("/tasks/accept/:id", async (req, res) => {
    try {
        const taskId = req.params.id;
        const { helperId } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { helper: helperId, status: "In Progress" },
            { new: true }
        ).populate("poster", "name points");

        if (!updatedTask) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.json({ success: true, message: "Task accepted successfully!", task: updatedTask });
    } catch (error) {
        console.error("Accept Task Error:", error);
        res.status(500).json({ success: false, message: "Server error while accepting task" });
    }
});

// TEST ROUTE
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "NeighbourHelp Backend is running!",
    });
});

// SERVER LISTENING
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});