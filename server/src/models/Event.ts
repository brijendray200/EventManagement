import mongoose, { Schema, Types } from "mongoose";

export interface IEvent {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
  galleryImages: string[];
  highlightPoints: string[];
  price: number;
  ticketsAvailable: number;
  ticketsSold: number;
  organizer: Types.ObjectId;
  organizerName: string;
  status: "approved" | "pending" | "rejected";
  isSponsored: boolean;
  createdAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200",
    },
    galleryImages: {
      type: [String],
      default: [],
    },
    highlightPoints: {
      type: [String],
      default: [],
    },
    price: { type: Number, default: 0 },
    ticketsAvailable: { type: Number, default: 100 },
    ticketsSold: { type: Number, default: 0 },
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    organizerName: { type: String, required: true },
    status: { type: String, enum: ["approved", "pending", "rejected"], default: "approved" },
    isSponsored: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Event = mongoose.model<IEvent>("Event", eventSchema);
