import { Router } from "express";
import { protect } from "../middleware/auth";
import { Notification } from "../models/Notification";

const router = Router();

router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user!._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const notification = await Notification.create({
      user: req.user!._id,
      title: req.body.title || "Notification",
      message: req.body.message || "",
      type: req.body.type || "info",
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/mark-all-read", protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user!._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/", protect, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user!._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user!._id },
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user!._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
