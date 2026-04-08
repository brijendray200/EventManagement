import { Router } from "express";
import { authorize, protect } from "../middleware/auth";
import { Ad } from "../models/Ad";
import { Booking } from "../models/Booking";
import { Event } from "../models/Event";
import { User } from "../models/User";

const router = Router();

router.use(protect, authorize("admin"));

router.get("/stats", async (_req, res) => {
  try {
    const [users, events, bookings, ads] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Booking.countDocuments(),
      Ad.countDocuments(),
    ]);

    const revenue = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);

    const pendingEvents = await Event.find({ status: "pending" }).sort({ createdAt: -1 }).limit(10);
    const recentBookings = await Booking.find({ paymentStatus: "paid" })
      .populate("user", "name email")
      .populate("event", "title")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        users,
        events,
        bookings,
        ads,
        totalRevenue: revenue[0]?.totalRevenue || 0,
        pendingEvents,
        recentBookings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/users", async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
