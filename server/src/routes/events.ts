import { Router } from "express";
import { authorize, protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { Booking } from "../models/Booking";
import { Event } from "../models/Event";
import { eventSchema } from "../validation/schemas";

const router = Router();

const categoryHighlights: Record<string, string[]> = {
  Concerts: ["Live stage energy", "Front-row crowd moments", "Lighting spectacle", "Artist performance close-ups"],
  Workshops: ["Hands-on learning zones", "Instructor-led sessions", "Team collaboration tables", "Practice and demo corners"],
  Seminars: ["Speaker stage view", "Audience networking lounge", "Presentation highlights", "Knowledge-sharing sessions"],
  Corporate: ["Premium networking areas", "Leadership keynote moments", "Brand presentation setup", "Professional hospitality zones"],
  Weddings: ["Decor details and styling", "Ceremony highlights", "Family celebration moments", "Food and venue ambience"],
};

const normalizeEvent = (event: any) => {
  const baseEvent = typeof event?.toObject === "function" ? event.toObject() : event;
  const imagePool = [event.image, ...(event.galleryImages || [])].filter(Boolean);
  const uniqueImages = [...new Set(imagePool)].slice(0, 20);
  return {
    ...baseEvent,
    image: uniqueImages[0],
    galleryImages: uniqueImages,
    highlightPoints:
      event.highlightPoints?.length > 0 ? event.highlightPoints : categoryHighlights[event.category] || categoryHighlights.Concerts,
  };
};

router.get("/", async (req, res) => {
  try {
    const { search, category, organizerId, includePending } = req.query;
    const query: any = {};

    if (!includePending) {
      query.status = "approved";
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (organizerId) {
      query.organizer = organizerId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: String(search), $options: "i" } },
        { location: { $regex: String(search), $options: "i" } },
        { category: { $regex: String(search), $options: "i" } },
      ];
    }

    const events = await Event.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: events.map(normalizeEvent) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/organizer/dashboard", protect, authorize("organizer", "admin"), async (req, res) => {
  try {
    const match = req.user!.role === "admin" ? {} : { organizer: req.user!._id };
    const events = await Event.find(match).sort({ createdAt: -1 });
    const eventIds = events.map((event) => event._id);
    const bookings = await Booking.find({ event: { $in: eventIds }, status: "confirmed" });

    const revenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const attendees = bookings.reduce((sum, booking) => sum + booking.quantity, 0);

    res.json({
      success: true,
      data: {
        organizer: {
          name: req.user!.name,
          email: req.user!.email,
          organizerProfile: req.user!.organizerProfile || {},
        },
        stats: {
          revenue,
          activeEvents: events.length,
          attendees,
          avgTicketPrice: events.length ? Math.round(events.reduce((sum, event) => sum + event.price, 0) / events.length) : 0,
        },
        events,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("organizer", "name email");
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({ success: true, data: normalizeEvent(event) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", protect, authorize("organizer", "admin"), validate(eventSchema), async (req, res) => {
  try {
    const incomingGallery = [req.body.image, ...(req.body.galleryImages || [])].filter(Boolean);
    const event = await Event.create({
      ...req.body,
      image: incomingGallery[0],
      galleryImages: [...new Set(incomingGallery)].slice(0, 20),
      highlightPoints:
        req.body.highlightPoints?.length > 0
          ? req.body.highlightPoints
          : categoryHighlights[req.body.category] || categoryHighlights.Concerts,
      organizer: req.user!._id,
      organizerName: req.user!.name,
      status: "approved",
    });

    res.status(201).json({ success: true, data: normalizeEvent(event) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id", protect, authorize("organizer", "admin"), validate(eventSchema.partial()), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (req.user!.role !== "admin" && String(event.organizer) !== String(req.user!._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const incomingGallery = [req.body.image ?? event.image, ...(req.body.galleryImages || event.galleryImages || [])].filter(Boolean);
    const payload = {
      ...req.body,
      image: incomingGallery[0],
      galleryImages: [...new Set(incomingGallery)].slice(0, 20),
      highlightPoints:
        req.body.highlightPoints?.length > 0
          ? req.body.highlightPoints
          : event.highlightPoints?.length > 0
            ? event.highlightPoints
            : categoryHighlights[req.body.category || event.category] || categoryHighlights.Concerts,
    };
    const updated = await Event.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    res.json({ success: true, data: normalizeEvent(updated) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", protect, authorize("organizer", "admin"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (req.user!.role !== "admin" && String(event.organizer) !== String(req.user!._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
