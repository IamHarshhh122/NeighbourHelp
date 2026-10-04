const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      default: "",
    },

    // User's saved home/address
    homeAddress: {
      type: String,
      default: "",
      trim: true,
    },

    homeLat: {
      type: Number,
      default: null,
    },

    homeLng: {
      type: Number,
      default: null,
    },

    skills: {
      type: [String],
      default: [],
    },

    points: {
      type: Number,
      default: 20,
    },

    tasksDone: {
      type: Number,
      default: 0,
    },

    tasksPosted: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 5.0,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);