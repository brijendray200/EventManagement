import mongoose, { Schema, Types } from "mongoose";

export interface IAd {
  user: Types.ObjectId;
  title: string;
  description: string;
  imageUrl: string;
  imageUrls: string[];
  videoUrls: string[];
  linkUrl: string;
  type: "banner" | "event_boost" | "sidebar";
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  status: "pending" | "active" | "expired";
  paymentId?: string;
  createdAt: Date;
}

const adSchema = new Schema<IAd>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageUrls: { type: [String], default: [] },
    videoUrls: { type: [String], default: [] },
    linkUrl: { type: String, required: true },
    type: { type: String, enum: ["banner", "event_boost", "sidebar"], default: "banner" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "active", "expired"], default: "pending" },
    paymentId: String,
  },
  { timestamps: true }
);

export const Ad = mongoose.model<IAd>("Ad", adSchema);
