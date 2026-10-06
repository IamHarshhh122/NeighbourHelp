const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  points: {
    type: Number,
    default: 20,
  },
  homeAddress: {
    type: String,
    default: "",
  },
  homeLat: {
    type: Number,
    default: null,
  },
  homeLng: {
    type: Number,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);