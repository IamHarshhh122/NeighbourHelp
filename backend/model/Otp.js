const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // seconds 
  },
});

module.exports = mongoose.model("Otp", otpSchema);