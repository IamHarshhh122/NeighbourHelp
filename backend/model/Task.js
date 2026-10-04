const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: "General Help",
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    poster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    helper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: [
        "Open",
        "Helping",
        "Awaiting Approval",
        "Completed",
        "Disputed",
        "Cancelled",
      ],
      default: "Open",
    },
    reward: {
      type: Number,
      default: 0,
    },
    completionPhoto: {
      type: String,
      default: null,
    },
    completionNotes: {
      type: String,
      default: "",
    },
    completionGps: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    autoConfirmAt: {
      type: Date,
      default: null,
    },
    disputeReason: {
      type: String,
      default: null,
    },
    disputeNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);