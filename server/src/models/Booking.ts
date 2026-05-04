import mongoose, { Schema, Types } from "mongoose";

export interface IBooking {
  event: Types.ObjectId;
  user: Types.ObjectId;
  attendeeName: string;
  attendeeEmail: string;
  quantity: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: "online" | "cod";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  isCheckedIn: boolean;
  checkedInAt?: Date;
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    attendeeName: { type: String, required: true },
    attendeeEmail: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentMethod: { type: String, enum: ["online", "cod"], default: "online" },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    isCheckedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
