import { Router } from "express";
import { SupportMessage } from "../models/SupportMessage";
import { validate } from "../middleware/validate";
import { contactSchema } from "../validation/schemas";

const router = Router();

router.post("/contact", validate(contactSchema), async (req, res) => {
  try {
    const { name, email, subject, message, userId } = req.body;
    const payload = await SupportMessage.create({ name, email, subject, message, user: userId || undefined });
    res.status(201).json({ success: true, data: payload, message: "Message received successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
