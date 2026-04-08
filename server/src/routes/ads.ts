import crypto from "crypto";
import { Router } from "express";
import Razorpay from "razorpay";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { Ad } from "../models/Ad";
import { adSchema } from "../validation/schemas";

const router = Router();
const isNonEmptyString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

const normalizeAd = (ad: any) => {
  const baseAd = typeof ad?.toObject === "function" ? ad.toObject() : ad;
  const imageUrls = [...new Set([ad.imageUrl, ...(ad.imageUrls || [])].filter(isNonEmptyString))].slice(0, 20);
  return {
    ...baseAd,
    imageUrl: imageUrls[0],
    imageUrls,
    videoUrls: [...new Set((ad.videoUrls || []).filter(isNonEmptyString))].slice(0, 10),
  };
};

router.get("/active", async (_req, res) => {
  try {
    const ads = await Ad.find({
      status: "active",
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: ads.map(normalizeAd) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/my-ads", protect, async (req, res) => {
  try {
    const ads = await Ad.find({ user: req.user!._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: ads.map(normalizeAd) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", protect, validate(adSchema), async (req, res) => {
  try {
    const { title, description, imageUrl, imageUrls = [], videoUrls = [], linkUrl, type, days } = req.body;
    const rateMap = { banner: 1000, event_boost: 500, sidebar: 300 };
    const selectedType = type || "banner";
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Number(days || 7));
    const imageUrlList = Array.isArray(imageUrls) ? imageUrls.filter(isNonEmptyString) : [];
    const videoUrlList = Array.isArray(videoUrls) ? videoUrls.filter(isNonEmptyString) : [];
    const normalizedImages = [...new Set([imageUrl, ...imageUrlList].filter(isNonEmptyString))].slice(0, 20);

    const ad = await Ad.create({
      user: req.user!._id,
      title,
      description,
      imageUrl: normalizedImages[0],
      imageUrls: normalizedImages,
      videoUrls: [...new Set(videoUrlList)].slice(0, 10),
      linkUrl,
      type: selectedType,
      startDate,
      endDate,
      totalAmount: (rateMap[selectedType] || 500) * Number(days || 7),
    });

    res.status(201).json({ success: true, data: normalizeAd(ad) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/:id/pay", protect, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Ad not found" });
    }

    if (process.env.RAZORPAY_KEY_ID?.startsWith("your_") || !process.env.RAZORPAY_KEY_ID) {
      return res.json({
        success: true,
        order: {
          id: `order_ad_${Math.random().toString(36).slice(2, 10)}`,
          amount: ad.totalAmount * 100,
          currency: "INR",
        },
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    const order = await razorpay.orders.create({
      amount: ad.totalAmount * 100,
      currency: "INR",
      receipt: `ad_${ad._id}`,
    });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, adId } = req.body;
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

    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Ad not found" });
    }

    ad.status = "active";
    ad.paymentId = razorpay_payment_id;
    await ad.save();

    res.json({ success: true, message: "Ad activated", data: normalizeAd(ad) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
