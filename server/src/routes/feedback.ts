import { Router } from "express";
import { protect, authorize } from "../middleware/auth";
import { Feedback } from "../models/Feedback";

const router = Router();

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
router.post("/", protect, async (req: any, res) => {
  try {
    const { rating, message, eventId, media } = req.body;
    
    if (!rating || !message) {
      return res.status(400).json({ success: false, message: "Please provide rating and message" });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      event: eventId || undefined,
      rating,
      message,
      media: media || [],
    });

    res.status(201).json({
      success: true,
      data: feedback,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get feedback for a specific event
// @route   GET /api/feedback/event/:eventId
// @access  Public
router.get("/event/:eventId", async (req, res) => {
  try {
    const feedback = await Feedback.find({ event: req.params.eventId }).sort("-createdAt");
    res.json({
      success: true,
      count: feedback.length,
      data: feedback,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all feedback (Admin)
// @route   GET /api/feedback
// @access  Private/Admin
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const feedback = await Feedback.find().populate("event", "title").sort("-createdAt");
    res.json({
      success: true,
      count: feedback.length,
      data: feedback,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
