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

const buildFallbackChat = (events: any[], message: string, organizerContext?: any) => {
  const intent = getIntent(message);
  const q = message.toLowerCase();

  // 1. ORGANIZER MODE (Strict)
  if (organizerContext) {
    const { name, totalRevenue, totalEvents, topEvent, paidBookings } = organizerContext;
    
    // Only proceed to attendee logic if they explicitly ask for recommendations
    const wantsRecommendations = q.includes("recommend") || q.includes("suggest") || q.includes("other events");
    
    if (!wantsRecommendations) {
      if (q.includes("revenue") || q.includes("earn") || q.includes("money") || q.includes("sales") || q.includes("income")) {
        return `Your current total revenue is INR ${totalRevenue}. You've secured ${paidBookings} paid bookings so far.`;
      }
      
      if (q.includes("event") && (q.includes("how many") || q.includes("count") || q.includes("list") || q.includes("my"))) {
        return `You have ${totalEvents} events listed. Your top performing event is "${topEvent}".`;
      }
      
      if (q.includes("performance") || q.includes("best") || q.includes("top") || q.includes("popular") || q.includes("analytics")) {
        return `Analytics show that "${topEvent}" is your most successful event, contributing to your total revenue of INR ${totalRevenue}.`;
      }

      if (q.includes("create") || q.includes("new") || q.includes("add") || q.includes("host")) {
        return "You can create a new event from your Organizer Dashboard. Need help with the title or category?";
      }

      if (intent === "greeting" || q.length < 4) {
        return `Hello ${name}! I'm your Business Assistant. You have ${totalEvents} events and INR ${totalRevenue} in revenue. How can I help with your business today?`;
      }

      // If no business keyword matches but user is organizer, don't give attendee matches unless asked
      return "I'm here to help with your organizer dashboard and business stats. You can ask about your revenue, event count, or how to create new events.";
    }
  }

  // 2. ATTENDEE MODE (Fallback)
  const city = detectCity(events, message);
  const category = detectCategory(events, message);

  if (intent === "greeting") {
    return "Hello! I'm your EventSphere Concierge. I can help you find events by city, category, or budget. What are you looking for today?";
  }

  if (intent === "booking") {
    return "To book, just click 'Book Now' on any event page. It's fast and secure!";
  }

  if (intent === "refund") {
    return "For refund inquiries, please visit our 'Contact' page or check the specific event's cancellation policy. If you have a booking ID, I can help you find the support contact.";
  }

  if (q.includes("contact") || q.includes("support") || q.includes("help")) {
    return "You can reach our support team via the 'Contact' page. We're available 24/7 to help with bookings, payments, or organizer queries.";
  }

  // Only find matches if no other intent was handled
  const ranked = findMatches(events, message);

  if (ranked.length > 0) {
    const eventList = ranked.map(formatEventLine).join(". ");
    let response = `I found some great matches for you: ${eventList}. `;
    if (city) response += `These are all located in ${city.charAt(0).toUpperCase() + city.slice(1)}. `;
    if (category) response += `They belong to the ${category} category. `;
    return response + "Would you like more details on any of these?";
  }

  if (city || category) {
    return `I see you're interested in ${category || 'events'} in ${city || 'your area'}. Unfortunately, we don't have exact matches right now, but you can explore all trending events on our home page!`;
  }

  return "I'm not sure I understood that perfectly. Try asking about events in a specific city, a category like 'Workshops', or your business stats if you're an organizer.";
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

router.post("/chat", protect, aiLimiter, validate(aiChatSchema), async (req: any, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const events = await Event.find({ status: "approved" }).sort({ isSponsored: -1, createdAt: -1 }).limit(20);
    const catalog = buildCatalog(events);

    // 1. Fetch Organizer context if applicable
    let organizerContextData: any = null;
    let organizerContextText = "";
    if (req.user && req.user.role === "organizer") {
      const orgEvents = await Event.find({ organizer: req.user._id });
      const orgBookings = await Booking.find({ event: { $in: orgEvents.map(e => e._id) }, paymentStatus: "paid" });
      const totalRevenue = orgBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      const topEvent = orgEvents.length > 0 ? orgEvents[0].title : "N/A";
      
      organizerContextData = {
        name: req.user.name,
        totalEvents: orgEvents.length,
        totalRevenue,
        topEvent,
        paidBookings: orgBookings.length
      };

      organizerContextText = `
Organizer Details:
- Name: ${req.user.name}
- Brand: ${req.user.organizerProfile?.brandName || "N/A"}
- Total Events Hosted: ${orgEvents.length}
- Total Revenue Earned: INR ${totalRevenue}
- Recent/Top Event: ${topEvent}
- Total Paid Bookings: ${orgBookings.length}
`;
    }

    if (!hasUsableGeminiKey()) {
      return res.json({
        success: true,
        data: buildFallbackChat(catalog, String(message), organizerContextData),
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!.trim());
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
You are EventSphere's production website AI concierge.
${
  organizerContextText 
    ? "The user is an ORGANIZER. Your PRIMARY goal is to act as their business consultant. Use the Organizer Details below to answer questions about their revenue, event performance, and business growth. IGNORE the attendee catalog unless they ask to see other events." 
    : "The user is an ATTENDEE. Help them find events from the catalog below."
}

${!organizerContextText ? `Only recommend events from this catalog:\n${JSON.stringify(catalog)}` : "Attendee event catalog is available but prioritize the Organizer's own data for their questions."}

${organizerContextText}

User message: ${message}

Rules:
- Be concise, professional, and helpful.
- For organizers: Always use their real data (Revenue, Events, etc.) provided in the Organizer Details.
- For attendees: Recommend specific events with city, date, and price.
- If no data is available for a question, say you are still gathering insights for their account.
`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ success: true, data: text, catalog: catalog.slice(0, 5) });
  } catch (_error) {
    const events = await Event.find({ status: "approved" }).sort({ isSponsored: -1, createdAt: -1 }).limit(20);
    const catalog = buildCatalog(events);

    // Re-fetch context in catch if needed, but easier to use a variable
    let fallbackContext: any = null;
    if (req.user && req.user.role === "organizer") {
        const orgEvents = await Event.find({ organizer: req.user._id });
        const orgBookings = await Booking.find({ event: { $in: orgEvents.map(e => e._id) }, paymentStatus: "paid" });
        fallbackContext = {
            name: req.user.name,
            totalEvents: orgEvents.length,
            totalRevenue: orgBookings.reduce((sum, b) => sum + b.totalPrice, 0),
            topEvent: orgEvents.length > 0 ? orgEvents[0].title : "N/A",
            paidBookings: orgBookings.length
        };
    }

    res.json({
      success: true,
      data: buildFallbackChat(catalog, String(req.body?.message || ""), fallbackContext),
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
