import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "user" | "organizer" | "admin";
  avatar?: string;
  phone?: string;
  bio?: string;
  organizerProfile?: {
    brandName?: string;
    organizationType?: string;
    phone?: string;
    city?: string;
    website?: string;
    eventFocus?: string;
    teamSize?: string;
  };
  refreshToken?: string;
  refreshTokenExpire?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
  getSignedJwtToken: () => string;
  getSignedRefreshToken: () => string;
  setRefreshToken: () => string;
  clearRefreshToken: () => void;
  getResetPasswordToken: () => string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["user", "organizer", "admin"], default: "user" },
    avatar: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1200",
    },
    phone: { type: String, default: "" },
    bio: { type: String, default: "" },
    organizerProfile: {
      brandName: { type: String, default: "" },
      organizationType: { type: String, default: "" },
      phone: { type: String, default: "" },
      city: { type: String, default: "" },
      website: { type: String, default: "" },
      eventFocus: { type: String, default: "" },
      teamSize: { type: String, default: "" },
    },
    refreshToken: String,
    refreshTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre("save", async function save(this: any) {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.getSignedJwtToken = function getSignedJwtToken() {
  return jwt.sign(
    { id: this._id },
    (process.env.JWT_SECRET || "dev-secret") as jwt.Secret,
    { expiresIn: (process.env.JWT_EXPIRE || "15m") as any }
  );
};

userSchema.methods.getSignedRefreshToken = function getSignedRefreshToken() {
  return jwt.sign(
    { id: this._id, type: "refresh" },
    (process.env.JWT_REFRESH_SECRET || "dev-refresh-secret") as jwt.Secret,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRE || "7d") as any }
  );
};

userSchema.methods.setRefreshToken = function setRefreshToken() {
  const refreshToken = this.getSignedRefreshToken();
  this.refreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const refreshDays = Number(process.env.JWT_REFRESH_COOKIE_DAYS || 7);
  this.refreshTokenExpire = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);
  return refreshToken;
};

userSchema.methods.clearRefreshToken = function clearRefreshToken() {
  this.refreshToken = undefined;
  this.refreshTokenExpire = undefined;
};

userSchema.methods.matchPassword = async function matchPassword(enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function getResetPasswordToken() {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

export const User = mongoose.model<IUser>("User", userSchema);
