const express = require("express");
const router = express.Router();

const Task = require("../model/Task");
const User = require("../model/User");

const toRad = (value) => {
  return (value * Math.PI) / 180;
};

const distanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

router.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("poster", "fullname name email points homeAddress homeLat homeLng")
      .populate("helper", "fullname name email points homeAddress homeLat homeLng")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Fetch All Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching tasks",
    });
  }
});

router.post("/tasks", async (req, res) => {
  try {
    const { title, description, category, location, poster, reward } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !location?.address ||
      location.lat == null ||
      location.lng == null ||
      !poster
    ) {
      return res.status(400).json({
        success: false,
        message: "All task and GPS fields are required",
      });
    }

    const lat = Number(location.lat);
    const lng = Number(location.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task GPS coordinates",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      category,
      location: {
        address: location.address.trim(),
        lat,
        lng,
      },
      poster,
      status: "Open",
      reward: Number(reward) || 0,
      messages: [],
    });

    await User.findByIdAndUpdate(poster, {
      $inc: { tasksPosted: 1 },
    });

    const populatedTask = await Task.findById(task._id)
      .populate("poster", "fullname name points homeAddress homeLat homeLng")
      .populate("helper", "fullname name points homeAddress homeLat homeLng");

    return res.status(201).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    console.error("Create Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating task",
    });
  }
});

router.get("/tasks/nearby", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radiusInKm) || 5;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        success: false,
        message: "Valid GPS latitude and longitude are required",
      });
    }

    const tasks = await Task.find({
      status: { $in: ["Open", "Helping", "In Progress"] },
    })
      .populate("poster", "fullname name points homeAddress homeLat homeLng")
      .populate("helper", "fullname name points homeAddress homeLat homeLng")
      .sort({ createdAt: -1 });

    const nearbyTasks = tasks
      .map((task) => {
        const taskLat = Number(task.location?.lat);
        const taskLng = Number(task.location?.lng);

        if (!Number.isFinite(taskLat) || !Number.isFinite(taskLng)) {
          return null;
        }

        const distance = distanceKm(lat, lng, taskLat, taskLng);

        return {
          ...task.toObject(),
          location: {
            address: task.location.address,
            lat: taskLat,
            lng: taskLng,
          },
          distanceKm: Number(distance.toFixed(2)),
        };
      })
      .filter((task) => task && task.distanceKm <= radius);

    return res.json({
      success: true,
      radiusKm: radius,
      count: nearbyTasks.length,
      tasks: nearbyTasks,
    });
  } catch (error) {
    console.error("Nearby Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching tasks",
    });
  }
});

router.put("/tasks/accept/:id", async (req, res) => {
  try {
    const { helperId } = req.body;

    if (!helperId) {
      return res.status(400).json({
        success: false,
        message: "Helper ID is required",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (String(task.poster) === String(helperId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot accept your own task",
      });
    }

    if (task.status !== "Open") {
      return res.status(400).json({
        success: false,
        message: "This task is no longer available",
      });
    }

    task.helper = helperId;
    task.status = "Helping";
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("poster", "fullname name points homeAddress homeLat homeLng")
      .populate("helper", "fullname name points homeAddress homeLat homeLng");

    return res.json({
      success: true,
      message: "Task accepted successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Accept Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while accepting task",
    });
  }
});

// HELPER: SUBMIT COMPLETION 
router.post("/tasks/complete/:id", async (req, res) => {
  try {
    const { helperId, photo, notes, gps } = req.body;

    if (!helperId) {
      return res.status(400).json({
        success: false,
        message: "Helper ID is required",
      });
    }

    if (!photo) {
      return res.status(400).json({
        success: false,
        message: "Photo proof is required",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (String(task.helper) !== String(helperId)) {
      return res.status(403).json({
        success: false,
        message: "Only the assigned helper can submit proof",
      });
    }

    if (task.status !== "Helping" && task.status !== "In Progress") {
      return res.status(400).json({
        success: false,
        message: "Task is not in a state to be completed",
      });
    }

    task.status = "Awaiting Approval";
    task.completionPhoto = photo;
    task.completionNotes = notes || "";
    task.completionGps = gps || null;
    task.completedAt = new Date();
    task.autoConfirmAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("poster", "fullname name points homeAddress homeLat homeLng")
      .populate("helper", "fullname name points homeAddress homeLat homeLng");

    return res.json({
      success: true,
      message: "Proof submitted. Waiting for poster confirmation.",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Complete Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while submitting proof",
    });
  }
});

//  POSTER: CONFIRM TASK 
router.put("/tasks/confirm/:id", async (req, res) => {
  try {
    const { posterId } = req.body;

    if (!posterId) {
      return res.status(400).json({
        success: false,
        message: "Poster ID is required",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (String(task.poster) !== String(posterId)) {
      return res.status(403).json({
        success: false,
        message: "Only the task poster can confirm",
      });
    }

    if (task.status !== "Awaiting Approval") {
      return res.status(400).json({
        success: false,
        message: "Task is not awaiting approval",
      });
    }

    const reward = task.reward || 0;

    if (task.helper && reward > 0) {
      await User.findByIdAndUpdate(task.helper, {
        $inc: { points: reward, tasksDone: 1 },
      });
    }

    task.status = "Completed";
    task.confirmedAt = new Date();
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("poster", "fullname name points homeAddress homeLat homeLng")
      .populate("helper", "fullname name points homeAddress homeLat homeLng");

    return res.json({
      success: true,
      message: "Task confirmed. Credits awarded to helper.",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Confirm Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while confirming task",
    });
  }
});

// ================= POSTER: RAISE DISPUTE =================
router.post("/tasks/dispute/:id", async (req, res) => {
  try {
    const { posterId, reason, customReason } = req.body;

    if (!posterId) {
      return res.status(400).json({
        success: false,
        message: "Poster ID is required",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (String(task.poster) !== String(posterId)) {
      return res.status(403).json({
        success: false,
        message: "Only the task poster can raise a dispute",
      });
    }

    if (task.status !== "Awaiting Approval") {
      return res.status(400).json({
        success: false,
        message: "Task is not awaiting approval",
      });
    }

    task.status = "Disputed";
    task.disputeReason = reason || "other";
    task.disputeNote = customReason || "";
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("poster", "fullname name points homeAddress homeLat homeLng")
      .populate("helper", "fullname name points homeAddress homeLat homeLng");

    return res.json({
      success: true,
      message: "Dispute raised. Our team will review within 48 hours.",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Dispute Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while raising dispute",
    });
  }
});

//  DEAL MESSAGE
router.post("/tasks/:id/message", async (req, res) => {
  try {
    const { senderId, senderName, text } = req.body;

    if (!senderId || !text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Sender and message text are required",
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task deal not found",
      });
    }

    const isPoster = String(task.poster) === String(senderId);
    const isHelper = String(task.helper) === String(senderId);

    if (!isPoster && !isHelper) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You are not part of this task deal",
      });
    }

    const newMessage = {
      senderId,
      senderName: senderName || "Neighbour",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdAt: new Date(),
    };

    task.messages = task.messages || [];
    task.messages.push(newMessage);
    await task.save();

    return res.json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});
// DELETE TASK
router.delete("/tasks/:id", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (String(task.poster) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only the task owner can delete this task",
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    await User.findByIdAndUpdate(userId, {
      $inc: { tasksPosted: -1 },
    });

    return res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting task",
    });
  }
});

module.exports = router;