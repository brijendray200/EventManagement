import crypto from "crypto";
import { Router } from "express";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { Booking } from "../models/Booking";
import { User } from "../models/User";
import { sendEmail } from "../utils/sendEmail";
import { attachAuthCookies, clearAuthCookies, hashToken, verifyRefreshToken } from "../utils/tokens";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema,
} from "../validation/schemas";

const router = Router();

const sendTokenResponse = async (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const refreshToken = user.setRefreshToken();
  await user.save({ validateBeforeSave: false });
  attachAuthCookies(res, token, refreshToken);
  res
    .status(statusCode)
    .json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        organizerProfile: user.organizerProfile,
      },
    });
};

router.post("/register", validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password, role, organizerProfile } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const normalizedOrganizerProfile =
      role === "organizer"
        ? {
            brandName: organizerProfile?.brandName || "",
            organizationType: organizerProfile?.organizationType || "",
            phone: organizerProfile?.phone || "",
            city: organizerProfile?.city || "",
            website: organizerProfile?.website || "",
            eventFocus: organizerProfile?.eventFocus || "",
            teamSize: organizerProfile?.teamSize || "",
          }
        : undefined;

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
      phone: req.body.phone || normalizedOrganizerProfile?.phone || "",
      organizerProfile: normalizedOrganizerProfile,
    });
    await sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    const bookingsCount = await Booking.countDocuments({ user: req.user!._id });
    res.json({
      success: true,
      data: {
        ...req.user!.toObject(),
        bookingsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/updatedetails", protect, validate(updateProfileSchema), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      {
        name: req.body.name,
        email: req.body.email,
        avatar: req.body.avatar,
        phone: req.body.phone,
        bio: req.body.bio,
        organizerProfile: req.body.organizerProfile,
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/updatepassword", protect, validate(updatePasswordSchema), async (req, res) => {
  try {
    const user = await User.findById(req.user!._id).select("+password");
    if (!user || !(await user.matchPassword(req.body.currentPassword))) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = req.body.newPassword;
    await user.save();
    await sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/forgotpassword", validate(forgotPasswordSchema), async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const requestOrigin = req.headers.origin;
    const clientBaseUrl =
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL || requestOrigin || "http://localhost:5173"
        : requestOrigin || process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientBaseUrl.replace(/\/$/, "")}/reset-password/${resetToken}`;
    const emailResult = await sendEmail({
      email: user.email,
      subject: "Reset your EventSphere password",
      message: `Reset your password here: ${resetUrl}`,
    });

    console.log("RESET LINK:", resetUrl);
    res.json({
      success: true,
      message: emailResult?.delivered ? "Reset link sent successfully" : "Email not configured yet. Use the reset link below for testing.",
      resetUrl: emailResult?.delivered ? undefined : resetUrl,
      emailDelivered: !!emailResult?.delivered,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/resetpassword/:resettoken", validate(resetPasswordSchema), async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(String(req.params.resettoken)).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/refresh", async (req, res) => {
  try {
    const headerRefreshToken = req.headers["x-refresh-token"];
    const refreshToken =
      req.cookies?.refresh_token ||
      (typeof headerRefreshToken === "string" ? headerRefreshToken : Array.isArray(headerRefreshToken) ? headerRefreshToken[0] : undefined);
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token missing" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || decoded.type !== "refresh") {
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const hashed = hashToken(refreshToken);
    if (user.refreshToken !== hashed || (user.refreshTokenExpire && user.refreshTokenExpire < new Date())) {
      user.clearRefreshToken();
      await user.save({ validateBeforeSave: false });
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: "Refresh token expired" });
    }

    await sendTokenResponse(user, 200, res);
  } catch (_error) {
    clearAuthCookies(res);
    return res.status(401).json({ success: false, message: "Refresh failed" });
  }
});

router.get("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);
      if (user) {
        user.clearRefreshToken();
        await user.save({ validateBeforeSave: false });
      }
    }
  } catch (_error) {
    // Ignore logout token errors and clear cookies regardless.
  }

  clearAuthCookies(res);
  res.json({ success: true });
});

export default router;
