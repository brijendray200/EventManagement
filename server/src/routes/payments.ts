import crypto from "crypto";
import { Router } from "express";
import { Ad } from "../models/Ad";
import { Booking } from "../models/Booking";
import { Event } from "../models/Event";
import { Notification } from "../models/Notification";

const router = Router();

router.post("/webhooks/razorpay", async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(400).json({ success: false, message: "Webhook secret not configured" });
    }

    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.body instanceof Buffer ? req.body.toString("utf8") : JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;

    if (eventType === "payment.captured") {
      const orderId = payload.payload?.payment?.entity?.order_id;
      const paymentId = payload.payload?.payment?.entity?.id;

      const booking = await Booking.findOne({ razorpayOrderId: orderId }).populate("event");
      if (booking && booking.status !== "confirmed") {
        booking.status = "confirmed";
        booking.paymentStatus = "paid";
        booking.razorpayPaymentId = paymentId;
        await booking.save();

        const event = await Event.findById((booking.event as any)._id);
        if (event) {
          event.ticketsAvailable -= booking.quantity;
          event.ticketsSold += booking.quantity;
          await event.save();
        }

        await Notification.create({
          user: booking.user,
          title: "Payment captured",
          message: `Your booking for ${(booking.event as any).title} has been confirmed via webhook.`,
          type: "payment",
        });
      }

      const ad = await Ad.findOne({ paymentId: { $exists: false }, status: "pending" });
      if (ad && !booking) {
        ad.status = "active";
        ad.paymentId = paymentId;
        await ad.save();
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
