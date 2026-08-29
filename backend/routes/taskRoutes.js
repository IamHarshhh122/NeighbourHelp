const express = require("express");
const router = express.Router();
const Task = require("../model/Task");

// POST: Create a new task
router.post("/tasks", async (req, res) => {
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

// GET: Fetch nearby tasks
router.get("/tasks/nearby", async (req, res) => {
    try {
        const tasks = await Task.find({}).populate("poster", "name points");
        res.json({ success: true, count: tasks.length, tasks });
    } catch (error) {
        console.error("Nearby Tasks Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching tasks" });
    }
});

// PUT: Accept a task
router.put("/tasks/accept/:id", async (req, res) => {
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

module.exports = router;