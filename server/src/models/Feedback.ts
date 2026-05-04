import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  user: mongoose.Types.ObjectId;
  event?: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  userRole: string;
  rating: number;
  message: string;
  media?: { url: string; type: "image" | "video" }[];
  createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event" },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userRole: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, trim: true },
    media: [
      {
        url: { type: String },
        type: { type: String, enum: ["image", "video"] },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Feedback = mongoose.model<IFeedback>("Feedback", feedbackSchema);
