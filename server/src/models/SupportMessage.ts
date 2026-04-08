import mongoose, { Schema, Types } from "mongoose";

export interface ISupportMessage {
  user?: Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

const supportMessageSchema = new Schema<ISupportMessage>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const SupportMessage = mongoose.model<ISupportMessage>("SupportMessage", supportMessageSchema);
