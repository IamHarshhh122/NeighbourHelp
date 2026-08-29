const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    poster: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    helper: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['Open', 'In Progress', 'Completed'], default: 'Open' },
    location: {
        address: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

taskSchema.index({ "location.lng": 1, "location.lat": 1 });

module.exports = mongoose.model('Task', taskSchema);