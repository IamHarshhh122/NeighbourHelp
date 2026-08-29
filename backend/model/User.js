const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
googleId: {type: String, unique: true, sparse: true, },
name: {type: String,required: true,trim: true,},
email: { type: String,required: true,unique: true,lowercase: true,trim: true,},
password: {type: String,default: null,},
phone: {type: String,default: "",},
location: { type: String,default: "", },
skills: {type: [String],default: [],},
points: {type: Number,default: 20,}, // 20 welcome points site ki taraf se},
tasksDone: {type: Number, default: 0, },// Helper ne total kitni madad ki
tasksPosted: {type: Number,default: 0,}, // User ne kitne kaam dale/karwaye
rating: {type: Number,default: 5.0, },
createdAt: {type: Date,default: Date.now,},
});

module.exports = mongoose.model("User", userSchema);