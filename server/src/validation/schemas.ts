import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6).max(128),
  role: z.enum(["user", "organizer", "admin"]).optional(),
  organizerProfile: z
    .object({
      brandName: z.string().trim().min(2).max(120).optional(),
      organizationType: z.string().trim().min(2).max(80).optional(),
      phone: z.string().trim().min(6).max(30).optional(),
      city: z.string().trim().min(2).max(80).optional(),
      website: z.url().optional().or(z.literal("")),
      eventFocus: z.string().trim().min(2).max(120).optional(),
      teamSize: z.string().trim().min(1).max(40).optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.email().trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  email: z.email().trim().toLowerCase(),
  otp: z.string().length(6),
  password: z.string().min(6).max(128),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().trim().toLowerCase(),
  avatar: z.url().optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  bio: z.string().max(300).optional(),
  organizerProfile: z
    .object({
      brandName: z.string().trim().min(2).max(120).optional().or(z.literal("")),
      organizationType: z.string().trim().min(2).max(80).optional().or(z.literal("")),
      phone: z.string().trim().max(30).optional().or(z.literal("")),
      city: z.string().trim().min(2).max(80).optional().or(z.literal("")),
      website: z.url().optional().or(z.literal("")),
      eventFocus: z.string().trim().max(120).optional().or(z.literal("")),
      teamSize: z.string().trim().max(40).optional().or(z.literal("")),
    })
    .optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6).max(128),
  newPassword: z.string().min(6).max(128),
});

export const eventSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(20).max(5000),
  date: z.string().min(3).max(50),
  time: z.string().min(3).max(20),
  location: z.string().trim().min(2).max(200),
  category: z.string().trim().min(2).max(50),
  image: z.url().optional().or(z.literal("")),
  galleryImages: z.array(z.url()).max(20).optional(),
  highlightPoints: z.array(z.string().trim().min(2).max(120)).max(10).optional(),
  price: z.number().min(0).max(100000),
  ticketsAvailable: z.number().int().min(1).max(100000).optional(),
  isSponsored: z.boolean().optional(),
});

export const bookingSchema = z.object({
  eventId: z.string().min(1),
  attendeeName: z.string().trim().min(2).max(80),
  attendeeEmail: z.email().trim().toLowerCase(),
  quantity: z.number().int().min(1).max(20),
  paymentMethod: z.enum(["online", "cod"]).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().trim().toLowerCase(),
  subject: z.string().trim().min(2).max(100),
  message: z.string().trim().min(10).max(2000),
  userId: z.string().optional(),
});

export const adSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(500),
  imageUrl: z.url(),
  imageUrls: z.array(z.url()).max(20).optional(),
  videoUrls: z.array(z.url()).max(10).optional(),
  linkUrl: z.url(),
  type: z.enum(["banner", "event_boost", "sidebar"]),
  days: z.coerce.number().int().min(1).max(90),
});

export const aiChatSchema = z.object({
  message: z.string().trim().min(2).max(2000),
});
