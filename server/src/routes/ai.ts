import { GoogleGenerativeAI } from "@google/generative-ai";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { Booking } from "../models/Booking";
import { Event } from "../models/Event";
import { aiChatSchema } from "../validation/schemas";

const router = Router();
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

const hasUsableGeminiKey = () => {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return false;
  const normalized = key.toLowerCase();
  return !normalized.includes("your_gemini_api_key") && !normalized.includes("placeholder") && key.length > 20;
};

const buildCatalog = (events: any[]) =>
  events.map((event) => ({
    id: String(event._id),
    title: event.title,
    category: event.category,
    date: event.date,
    time: event.time,
    location: event.location,
    price: event.price,
    ticketsAvailable: event.ticketsAvailable,
    isSponsored: event.isSponsored,
    description: event.description,
  }));

const extractCity = (location: string) => {
  const parts = String(location)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts[parts.length - 1] || String(location).trim();
};

const scoreEvent = (event: any, query: string) => {
  const q = query.toLowerCase();
  let score = 0;
  if (q.includes(event.category.toLowerCase())) score += 4;
  if (q.includes(extractCity(event.location).toLowerCase())) score += 5;
  if (q.includes("free") && event.price === 0) score += 3;
  if (q.includes("cheap") && event.price <= 1000) score += 2;
  if ((q.includes("budget") || q.includes("under")) && event.price <= 1500) score += 2;
  if (q.includes("premium") && event.price > 2000) score += 2;
  if (q.includes(event.title.toLowerCase())) score += 5;
  if (q.includes("today") || q.includes("tomorrow") || q.includes("this week")) score += 1;
  if (event.isSponsored) score += 1;
  return score;
};

const formatEventLine = (event: any) =>
  `${event.title} in ${extractCity(event.location)} on ${event.date} for INR ${event.price}`;

const getIntent = (message: string) => {
  const q = message.toLowerCase();

  if (/(hi|hello|hey|hii|namaste)\b/.test(q)) return "greeting";
  if (q.includes("refund")) return "refund";
  if (q.includes("book") || q.includes("booking") || q.includes("ticket")) return "booking";
  if (q.includes("payment") || q.includes("pay")) return "payment";
  if (q.includes("organizer") || q.includes("create event") || q.includes("host event")) return "organizer";
  if (q.includes("recommend") || q.includes("event") || q.includes("concert") || q.includes("workshop") || q.includes("seminar")) return "recommendation";
  return "general";
};

const detectCity = (events: any[], message: string) => {
  const q = message.toLowerCase();
  const knownCities = Array.from(new Set(events.map((event) => extractCity(event.location).toLowerCase())));
  return knownCities.find((city) => q.includes(city)) || "";
};

const detectCategory = (events: any[], message: string) => {
  const q = message.toLowerCase();
  const categories = Array.from(new Set(events.map((event) => String(event.category).toLowerCase())));
  return categories.find((category) => q.includes(category.toLowerCase())) || "";
};

const findMatches = (events: any[], message: string) => {
  const q = message.toLowerCase();
  const city = detectCity(events, message);
  const category = detectCategory(events, message);
  const wantsCheap = q.includes("cheap") || q.includes("budget") || q.includes("under");
  const wantsPremium = q.includes("premium") || q.includes("luxury");

  const prefiltered = events.filter((event) => {
    const cityOk = city ? extractCity(event.location).toLowerCase() === city : true;
    const categoryOk = category ? String(event.category).toLowerCase() === category : true;
    const cheapOk = wantsCheap ? event.price <= 1500 : true;
    const premiumOk = wantsPremium ? event.price >= 2000 : true;
    return cityOk && categoryOk && cheapOk && premiumOk;
  });

  const base = prefiltered.length > 0 ? prefiltered : events;

  const ranked = [...base]
    .map((event) => ({ event, score: scoreEvent(event, message) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.event);

  return ranked.slice(0, 3);
};

const buildFallbackChat = (events: any[], message: string) => {
  const intent = getIntent(message);
  const ranked = findMatches(events, message);

  if (intent === "greeting") {
    const featured = events.slice(0, 3).map(formatEventLine).join(". ");
    return `Hi! I can help with event recommendations, booking steps, refunds, payments, and organizer questions. Popular options right now: ${featured}.`;
  }

  if (intent === "booking") {
    return "To book an event: open the event page, click Book Now, enter attendee details, complete payment, and your ticket will appear in My Bookings. If you want, I can also suggest events by city or budget.";
  }

  if (intent === "refund") {
    return "Refunds depend on the event and payment status. Open your booking, check the event details or contact support from the Contact page. If you share the event or booking issue, I can guide you further.";
  }

  if (intent === "payment") {
    return "Payments are completed through the payment step after booking. If payment fails, try again from the booking flow and check that your booking status becomes confirmed in My Bookings.";
  }

  if (intent === "organizer") {
    return "Organizers can create events, manage attendees, and view dashboard analytics after signing up as Organizer. If you already have an organizer account, go to Organizer Dashboard to create your first event.";
  }

  if (ranked.length === 0) {
    return "I could not find an exact match. Try asking by city, category, or budget, for example: Mumbai concerts, cheap workshops, or premium events.";
  }

  return `Based on your query, these are the best matches: ${ranked
    .map(formatEventLine)
    .join(". ")}. If you want, I can narrow this down by city, category, or budget.`;
};

router.get("/recommendations", async (req, res) => {
  try {
    const { city = "", category = "", budget = "" } = req.query;
    const events = await Event.find({ status: "approved" }).sort({ isSponsored: -1, createdAt: -1 }).limit(30);
    const filtered = events.filter((event) => {
      const cityMatch = city ? event.location.toLowerCase().includes(String(city).toLowerCase()) : true;
      const categoryMatch = category ? event.category.toLowerCase() === String(category).toLowerCase() : true;
      const budgetMatch = budget ? event.price <= Number(budget) : true;
      return cityMatch && categoryMatch && budgetMatch;
    });

    res.json({
      success: true,
      data: buildCatalog(filtered.slice(0, 8)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/chat", aiLimiter, validate(aiChatSchema), async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const events = await Event.find({ status: "approved" }).sort({ isSponsored: -1, createdAt: -1 }).limit(20);
    const catalog = buildCatalog(events);

    if (!hasUsableGeminiKey()) {
      return res.json({
        success: true,
        data: buildFallbackChat(catalog, String(message)),
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!.trim());
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
You are EventSphere's production website AI concierge.
Only recommend events from this catalog:
${JSON.stringify(catalog)}

User message: ${message}

Rules:
- Be concise and helpful.
- Prefer explicit recommendations from the catalog.
- Mention city, date, and price when recommending.
- If no close match exists, say that clearly and suggest nearby alternatives from the catalog.
`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ success: true, data: text, catalog: catalog.slice(0, 5) });
  } catch (_error) {
    const events = await Event.find({ status: "approved" }).sort({ isSponsored: -1, createdAt: -1 }).limit(20);
    const catalog = buildCatalog(events);
    res.json({
      success: true,
      data: buildFallbackChat(catalog, String(req.body?.message || "")),
    });
  }
});

router.get("/event-summary/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const summary = {
      headline: `${event.title} is a ${event.category.toLowerCase()} experience happening in ${event.location}.`,
      highlights: [
        `Date: ${event.date} at ${event.time}`,
        `Ticket price: INR ${event.price}`,
        `Tickets left: ${event.ticketsAvailable}`,
      ],
      cta: event.ticketsAvailable > 0 ? "Tickets are available now." : "Currently sold out or unavailable.",
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/organizer-insights", protect, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user!._id }).sort({ createdAt: -1 });
    const bookings = await Booking.find({ event: { $in: events.map((event) => event._id) }, paymentStatus: "paid" }).populate("event");

    const topEvent = bookings.reduce(
      (acc: any, booking: any) => {
        const title = booking.event?.title || "Unknown";
        acc[title] = (acc[title] || 0) + booking.totalPrice;
        return acc;
      },
      {}
    );

    const sorted = Object.entries(topEvent).sort((a: any, b: any) => b[1] - a[1]);

    res.json({
      success: true,
      data: {
        totalEvents: events.length,
        paidBookings: bookings.length,
        totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
        topPerformingEvent: sorted[0] ? { title: sorted[0][0], revenue: sorted[0][1] } : null,
        recommendations: [
          events.length === 0 ? "Create your first event to start collecting demand signals." : "Promote your best-selling event on the homepage banner.",
          bookings.length < 5 ? "Consider lowering price or boosting visibility for low-conversion events." : "Your portfolio is converting. Add follow-up ads to drive more repeat bookings.",
        ],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
