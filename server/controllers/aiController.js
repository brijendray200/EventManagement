const { GoogleGenerativeAI } = require("@google/generative-ai");
const Event = require('../models/Event');

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    AI Event Recommendation / Chat
// @route   POST /api/ai/chat
// @access  Public
exports.aiChat = async (req, res, next) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Please provide a message' });
        }

        // Fetch all upcoming events to provide as context to AI
        const events = await Event.find({}).limit(20); // Top 20 for context

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const eventContext = events.map(event => ({
            title: event.title,
            description: event.description,
            category: event.category,
            price: event.price,
            date: event.date,
            location: event.location
        }));

        const prompt = `
        You are "EventSphere AI Assistant". 
        Your job is to help users find the best events.
        
        Available Events Context:
        ${JSON.stringify(eventContext)}

        User Question: "${message}"

        Be helpful, concise, and recommend specific events from the list above if they match the user's intent. 
        If no such event exists, suggest related things or tell them to check back later.
        Use a friendly, professional tone.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({
            success: true,
            data: text
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "AI Assistant is currently unavailable." });
    }
};
