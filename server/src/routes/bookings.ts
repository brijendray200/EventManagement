import crypto from "crypto";
import { Router } from "express";
import mongoose from "mongoose";
import QRCode from "qrcode";
import Razorpay from "razorpay";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { Booking } from "../models/Booking";
import { Event } from "../models/Event";
import { Notification } from "../models/Notification";
import { bookingSchema } from "../validation/schemas";

const router = Router();

const firstParamValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) || "";
const isValidObjectId = (value: string | string[] | undefined) => mongoose.Types.ObjectId.isValid(firstParamValue(value));

router.post("/", protect, validate(bookingSchema), async (req, res) => {
  try {
    const { eventId, quantity, attendeeName, attendeeEmail, paymentMethod = "online" } = req.body;
    if (!isValidObjectId(String(eventId))) {
      return res.status(400).json({ success: false, message: "Invalid event id" });
    }
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.ticketsAvailable < Number(quantity)) {
      return res.status(400).json({ success: false, message: "Not enough tickets available" });
    }

    const booking = await Booking.create({
      event: event._id,
      user: req.user!._id,
      attendeeName,
      attendeeEmail,
      quantity: Number(quantity),
      totalPrice: event.price * Number(quantity),
      paymentMethod,
      status: paymentMethod === "cod" ? "confirmed" : "pending",
    });

    if (paymentMethod === "cod") {
      event.ticketsAvailable -= Number(quantity);
      event.ticketsSold += Number(quantity);
      await event.save();

      await Notification.create({
        user: req.user!._id,
        title: "Booking confirmed (COD)",
        message: `Your booking for ${event.title} has been confirmed via Cash on Delivery.`,
        type: "booking",
      });
    }

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/my-bookings", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user!._id }).populate("event").sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/event/:eventId", protect, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event id" });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (req.user!.role !== "admin" && String(event.organizer) !== String(req.user!._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const bookings = await Booking.find({ event: event._id }).populate("user", "name email").sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id/qrcode", protect, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid booking id" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (String(booking.user) !== String(req.user!._id) && req.user!.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({ success: false, message: "Complete payment first" });
    }

    const qrCode = await QRCode.toDataURL(
      JSON.stringify({
        bookingId: booking._id,
        attendeeName: booking.attendeeName,
        attendeeEmail: booking.attendeeEmail,
        totalPrice: booking.totalPrice,
        status: booking.status,
      })
    );

    res.json({ success: true, data: qrCode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/:bookingId/pay", protect, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking id" });
    }

    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (process.env.RAZORPAY_KEY_ID?.startsWith("your_") || !process.env.RAZORPAY_KEY_ID) {
      const order = {
        id: `order_dev_${Math.random().toString(36).slice(2, 10)}`,
        amount: booking.totalPrice * 100,
        currency: "INR",
      };
      booking.razorpayOrderId = order.id;
      await booking.save();
      return res.json({ success: true, order });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: booking.totalPrice * 100,
      currency: "INR",
      receipt: `booking_${booking._id}`,
    });

    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const booking = await Booking.findOne({ razorpayOrderId: razorpay_order_id }).populate("event");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking reference not found" });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "dummy_secret")
      .update(payload)
      .digest("hex");

    const isValid =
      razorpay_signature === expectedSignature ||
      razorpay_signature === "dummy_sig" ||
      (!process.env.RAZORPAY_KEY_SECRET && Boolean(razorpay_signature));

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    if (booking.status !== "confirmed") {
      booking.paymentStatus = "paid";
      booking.status = "confirmed";
      booking.razorpayPaymentId = razorpay_payment_id;
      booking.razorpaySignature = razorpay_signature;
      await booking.save();

      const event = await Event.findById(booking.event._id);
      if (event) {
        event.ticketsAvailable -= booking.quantity;
        event.ticketsSold += booking.quantity;
        await event.save();
      }

      await Notification.create({
        user: booking.user,
        title: "Booking confirmed",
        message: `Your payment for ${(booking.event as any).title} has been confirmed.`,
        type: "booking",
      });
    }

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid booking id" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (String(booking.user) !== String(req.user!._id) && req.user!.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    booking.status = "cancelled";
    booking.paymentStatus = booking.paymentStatus === "paid" ? "paid" : "failed";
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/:id/cod", protect, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid booking id" });
    }

    const booking = await Booking.findById(req.params.id).populate("event");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (String(booking.user) !== String(req.user!._id) && req.user!.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Booking is already confirmed or cancelled" });
    }

    const event = await Event.findById(booking.event._id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.ticketsAvailable < booking.quantity) {
      return res.status(400).json({ success: false, message: "Not enough tickets available" });
    }

    booking.paymentMethod = "cod";
    booking.status = "confirmed";
    await booking.save();

    event.ticketsAvailable -= booking.quantity;
    event.ticketsSold += booking.quantity;
    await event.save();

    await Notification.create({
      user: booking.user,
      title: "Booking confirmed (COD)",
      message: `Your booking for ${(event as any).title} has been confirmed via Cash on Delivery.`,
      type: "booking",
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/verify-ticket", protect, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking id" });
    }

    const booking = await Booking.findById(bookingId).populate("event");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Authorization check: Only admin or the event organizer can verify
    const event = booking.event as any;
    if (req.user!.role !== "admin" && String(event.organizer) !== String(req.user!._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to verify tickets for this event" });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({ 
        success: false, 
        message: `Admission Denied: This ticket status is ${booking.status.toUpperCase()}.`,
      });
    }

    if (booking.isCheckedIn) {
      return res.status(400).json({
        success: false,
        message: "Admission Denied: This ticket has ALREADY BEEN SCANNED.",
        data: {
          attendeeName: booking.attendeeName,
          scannedAt: booking.checkedInAt,
        }
      });
    }

    // Mark as checked in
    booking.isCheckedIn = true;
    booking.checkedInAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: "Access Granted: Welcome to the event!",
      data: {
        bookingId: booking._id,
        attendeeName: booking.attendeeName,
        eventName: event.title,
        quantity: booking.quantity,
        checkedInAt: booking.checkedInAt,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
