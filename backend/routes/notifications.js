const express = require("express");
const Notification = require("../models/Notification");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Get recent notifications for the logged in user
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.user.id })
       .populate("sender", "name")
       .sort({ createdAt: -1 })
       .limit(30);
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Mark all as read
router.put("/read", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.user.id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Mark single notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    
    // Only the recipient can mark it as read
    if (notification.recipient.toString() !== req.user.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
