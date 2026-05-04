const { GoogleGenerativeAI } = require("@google/generative-ai");
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    AI Chat - Role-aware (Organizer vs Attendee)
// @route   POST /api/ai/chat
// @access  Private
exports.aiChat = async (req, res, next) => {
    try {
        const { message } = req.body;
        const userRole = req.user?.role || req.body.role;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Please provide a message' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        let prompt = '';

        if (userRole === 'organizer' || userRole === 'admin') {
            // ========== ORGANIZER AI CONTEXT ==========
            // Get organizer's own events
            const userId = req.user?.id;
            let orgEvents = [];
            let orgBookings = [];
            let totalRevenue = 0;
            let totalAttendees = 0;

            if (userId) {
                orgEvents = await Event.find({ organizer: userId }).lean();
                const eventIds = orgEvents.map(e => e._id);
                orgBookings = await Booking.find({ event: { $in: eventIds } })
                    .populate('user', 'name email')
                    .populate('event', 'title date price')
                    .lean();

                totalRevenue = orgBookings
                    .filter(b => b.paymentStatus === 'paid')
                    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
                totalAttendees = orgBookings.filter(b => b.status === 'confirmed').length;
            }

            const eventsContext = orgEvents.map(e => ({
                id: e._id,
                title: e.title,
                date: e.date,
                time: e.time,
                location: e.location,
                price: e.price,
                ticketsAvailable: e.ticketsAvailable,
                category: e.category,
                isSponsored: e.isSponsored,
                ticketsSold: orgBookings.filter(b => b.event?._id?.toString() === e._id.toString() && b.status === 'confirmed').reduce((sum, b) => sum + b.quantity, 0),
                revenue: orgBookings.filter(b => b.event?._id?.toString() === e._id.toString() && b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalPrice, 0)
            }));

            const recentBookings = orgBookings.map(b => ({
                eventTitle: b.event?.title || 'Unknown',
                attendeeName: b.user?.name || 'Unknown',
                attendeeEmail: b.user?.email || '',
                quantity: b.quantity,
                totalPrice: b.totalPrice,
                status: b.status,
                paymentStatus: b.paymentStatus,
                bookingDate: b.bookingDate
            }));

            prompt = `
You are "EventSphere Organizer AI Assistant" — a powerful business intelligence AI for event organizers.

== ORGANIZER DASHBOARD CONTEXT ==
Total Events: ${orgEvents.length}
Total Revenue: ₹${totalRevenue}
Total Confirmed Attendees: ${totalAttendees}

Events Owned:
${JSON.stringify(eventsContext, null, 2)}

Bookings Data:
${JSON.stringify(recentBookings.slice(0, 50), null, 2)}

== YOUR CAPABILITIES ==
- Analyze revenue trends and give business insights
- Help with event promotion strategies
- Suggest pricing optimization
- Provide attendee analysis and engagement tips
- Help create event descriptions and marketing copy
- Answer questions about event analytics
- Suggest best times to host events
- Advise on ticket pricing strategies
- Generate event ideas based on market trends
- Help with attendee communication templates

== CRITICAL RULES ==
1. DIRECT ANSWERS ONLY: Answer exactly what the user asks. Do not provide unprompted advice, do not summarize all data unless asked, and do not add filler text.
2. USE CONTEXT DATA: You MUST use the exact data provided in the "ORGANIZER DASHBOARD CONTEXT" section.
3. NO HALLUCINATION: NEVER invent or guess data. If the data to answer the user's question is not in the context, explicitly say: "I do not have that data."
4. BE CONCISE: Keep responses extremely short, direct, and to the point.
5. Use ₹ for currency when discussing money.

User's Question: "${message}"

Provide a direct, correct response strictly based on the provided context data:`;

        } else {
            // ========== ATTENDEE AI CONTEXT ==========
            // Get upcoming events for discovery
            const events = await Event.find({}).sort('-createdAt').limit(20).lean();

            // Get user's bookings if authenticated
            let userBookings = [];
            if (req.user?.id) {
                userBookings = await Booking.find({ user: req.user.id })
                    .populate('event', 'title date location price')
                    .lean();
            }

            const eventContext = events.map(event => ({
                title: event.title,
                description: event.description?.substring(0, 100),
                category: event.category,
                price: event.price,
                date: event.date,
                location: event.location,
                ticketsAvailable: event.ticketsAvailable
            }));

            const bookingContext = userBookings.slice(0, 5).map(b => ({
                eventTitle: b.event?.title || 'Unknown',
                date: b.event?.date,
                status: b.status,
                paymentStatus: b.paymentStatus,
                quantity: b.quantity,
                totalPrice: b.totalPrice
            }));

            prompt = `
You are "EventSphere AI Concierge" — a friendly and knowledgeable event discovery assistant for attendees.

== AVAILABLE EVENTS ==
${JSON.stringify(eventContext, null, 2)}

== USER'S BOOKINGS ==
${JSON.stringify(bookingContext, null, 2)}

== YOUR CAPABILITIES ==
- Help users find and discover events
- Recommend events based on interests/category/location
- Explain booking and payment process
- Help with ticket-related questions
- Provide refund/cancellation policy info
- Answer general event queries
- Suggest events for occasions (birthday, date night, etc.)
- Help compare similar events
- Guide through the booking flow

== RULES ==
- Be friendly, enthusiastic, and conversational
- Recommend specific events from the list when relevant
- If no matching event exists, suggest checking back or similar categories
- Keep responses concise and actionable
- Use ₹ for currency
- If user has bookings, reference them when relevant
- If user asks about something unrelated to events, politely redirect but still be helpful

User's Question: "${message}"

Provide a helpful, friendly response:`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({
            success: true,
            data: text
        });

    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ success: false, message: "AI Assistant is currently unavailable." });
    }
};

// @desc    Get AI event summary (for AIConcierge page context)
// @route   GET /api/ai/event-summary/:eventId
// @access  Public
exports.getEventSummary = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                headline: `${event.title} is a ${event.category} event on ${event.date} at ${event.location}`,
                title: event.title,
                category: event.category,
                price: event.price,
                date: event.date,
                location: event.location
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    AI Smart Suggestions for Organizer
// @route   POST /api/ai/organizer-insights
// @access  Private (Organizer/Admin)
exports.organizerInsights = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const events = await Event.find({ organizer: userId }).lean();
        const eventIds = events.map(e => e._id);
        const bookings = await Booking.find({ event: { $in: eventIds }, status: 'confirmed' }).lean();

        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const totalAttendees = bookings.length;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
You are an AI business analyst for an event organizer on EventSphere platform.

Current Stats:
- Total Events: ${events.length}
- Total Revenue: ₹${totalRevenue}
- Total Attendees: ${totalAttendees}
- Events: ${JSON.stringify(events.map(e => ({ title: e.title, category: e.category, price: e.price, tickets: e.ticketsAvailable })))}

Generate 3 actionable business insights/suggestions for this organizer. 
Format as JSON array with objects having "title" and "suggestion" fields.
Keep each suggestion under 2 sentences.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Try to parse JSON from the response
        let insights;
        try {
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [{ title: "Growth Tip", suggestion: text }];
        } catch {
            insights = [{ title: "AI Insight", suggestion: text }];
        }

        res.status(200).json({ success: true, data: insights });
    } catch (error) {
        console.error('AI Insights Error:', error);
        res.status(500).json({ success: false, message: "Could not generate insights." });
    }
};
