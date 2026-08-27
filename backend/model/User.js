const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true }, 
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    skills: { type: [String], default: [] },
    rating: { type: Number, default: 5.0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);