import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  ChevronRight, 
  Ticket, 
  MapPin, 
  Calendar,
  HelpCircle,
  Zap,
  ArrowRight,
  Trash2,
  Maximize2,
  Plus
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLocation as useUserLocation } from '../context/LocationContext';
import api from '../utils/api';
import './AIConcierge.css';

const AIConcierge = ({ userRole }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { city: userCity } = useUserLocation();
    
    const isOrganizer = ['organizer', 'admin'].includes(userRole);

    // Initial message based on role
    const getInitialMessage = () => {
        if (isOrganizer) return `Hi! I'm your AI Business Assistant. How can I help you manage your events and revenue today?`;
        return `Hi! I'm your EventSphere Concierge. How can I help you today?`;
    };

    const [currentEvent, setCurrentEvent] = useState(null);
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: getInitialMessage(), 
            sender: 'bot', 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
    ]);
    const isCompactDock =
        pathname.includes('/events/') ||
        pathname.includes('/payment/') ||
        pathname.includes('/contact') ||
        pathname.includes('/organizer/create-event');

    // Detect Page Context
    useEffect(() => {
        const pathParts = pathname.split('/');
        
        if (isOrganizer) {
            setCurrentEvent(null);
            if (pathname.includes('/organizer/dashboard') && isOpen && messages.length < 5) {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now(),
                        text: `Welcome to your Creator Command Center! I can help you analyze your revenue trends, manage attendees, or launch a new event. What's our first objective today?`,
                        sender: 'bot',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]);
            } else if (pathname.includes('/organizer/create-event') && isOpen && messages.length < 5) {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now(),
                        text: `Let's create a great event! Need help writing an engaging description or picking a category?`,
                        sender: 'bot',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]);
            } else if (pathname.includes('/admin/') && isOpen && messages.length < 5) {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now(),
                        text: `System Admin mode activated. I'm ready to assist with event approvals, user management, and global platform analytics. How can I facilitate your moderation today?`,
                        sender: 'bot',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]);
            }
        } else {
            // Attendee Context
            if (pathname.includes('/events/') && pathParts[2]) {
                api.get(`/ai/event-summary/${pathParts[2]}`)
                    .then(({ data }) => {
                        if (data?.success) {
                            setCurrentEvent({ _id: pathParts[2], title: data.data.headline.split(' is ')[0] || 'this event' });
                        } else {
                            setCurrentEvent({ _id: pathParts[2], title: 'this event' });
                        }
                    })
                    .catch(() => setCurrentEvent({ _id: pathParts[2], title: 'this event' }));
            } else if (pathname.includes('/booking/')) {
                setCurrentEvent(null);
                if (isOpen && messages.length < 5) {
                    setMessages(prev => [
                        ...prev,
                        {
                            id: Date.now(),
                            text: `Almost there! Just fill in your name and email. We'll send the ticket to your email instantly after payment. Need any help with the form?`,
                            sender: 'bot',
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                    ]);
                }
            } else if (pathname.includes('/payment/')) {
                setCurrentEvent(null);
                if (isOpen && messages.length < 5) {
                    setMessages(prev => [
                        ...prev,
                        {
                            id: Date.now(),
                            text: `You're at the final step! We use Razorpay for secure payments. You can use UPI, Cards, or Netbanking. Having trouble with the payment gateway?`,
                            sender: 'bot',
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                    ]);
                }
            } else {
                setCurrentEvent(null);
            }
        }
    }, [pathname, isOpen, isOrganizer]);

    // Update welcome message when city is detected (Only for attendees)
    useEffect(() => {
        if (!isOrganizer && userCity && userCity !== 'Detecting...' && messages.length === 1) {
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[0].text = `Hi! I'm your AI Concierge. I see you're in ${userCity}! Would you like to check out the trending events nearby?`;
                return newMsgs;
            });
        }
    }, [userCity, isOrganizer]);

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isTyping, isOpen]);

    const getAIResponse = async (query) => {
        try {
            const { data } = await api.post('/ai/chat', { message: query, role: userRole });
            if (data.success) {
                return data.data;
            }
            return "I'm sorry, I'm having trouble connecting to my AI core right now.";
        } catch (error) {
            console.error('AI Error:', error);
            return "Server is currently unavailable. Please try again later.";
        }
    };

    const handleSend = async (text = input) => {
        const messageText = text.trim();
        if (!messageText) return;

        const userMsg = {
            id: Date.now(),
            text: messageText,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const responseText = await getAIResponse(userMsg.text);
        
        const botMsg = {
            id: Date.now() + 1,
            text: responseText,
            sender: 'bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setIsTyping(false);
        setMessages(prev => [...prev, botMsg]);
    };

    // Completely Segregated Quick Actions
    const organizerQuickActions = [
        { label: "Show my total revenue", icon: <Zap size={12}/> },
        { label: "How many live events?", icon: <Calendar size={12}/> },
        { label: "Which event is top performing?", icon: <Sparkles size={12}/> },
        { label: "How to create new event?", icon: <Plus size={12}/>, action: () => navigate('/organizer/create-event') }
    ];

    const attendeeQuickActions = currentEvent ? [
        { label: `Book ${currentEvent.title.split(' ')[0]}`, icon: <Ticket size={12}/>, action: () => navigate(`/booking/${currentEvent._id || currentEvent.id}`) },
        { label: "Event Agenda", icon: <Calendar size={12}/> },
        { label: "Refund Policy", icon: <HelpCircle size={12}/> },
        { label: "Need Help?", icon: <MessageSquare size={12}/> }
    ] : [
        { label: `Events in ${userCity || 'City'}`, icon: <MapPin size={12}/>, action: () => navigate('/events') },
        { label: "How to book?", icon: <Ticket size={12}/> },
        { label: "Refund Policy", icon: <HelpCircle size={12}/> },
        { label: "Switch to Host", icon: <Zap size={12}/> }
    ];

    const quickActions = isOrganizer ? organizerQuickActions : attendeeQuickActions;

    const clearChat = () => {
        setMessages([
            { 
                id: Date.now(), 
                text: `Hi! I've cleared the history. How can I help you now?`, 
                sender: 'bot', 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }
        ]);
    };

    return (
        <div className="ai-concierge-container">
            {/* TOOLTIP ON HOVER */}
            {!isOpen && !isCompactDock && (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ai-chat-hint"
                >
                    <div className="hint-content">
                        <Sparkles size={14} className="sparkle-icon" />
                        <span>How can I help you today?</span>
                    </div>
                    <div className="hint-arrow"></div>
                </motion.div>
            )}

            {/* TOGGLE BUTTON */}
            <motion.button 
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className={`ai-toggle-btn ${isOpen ? 'active' : ''} ${isCompactDock ? 'compact-dock' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : (
                    <div className="bot-icon-wrapper">
                        <Bot size={28} className="pulse-bot" />
                        <span className="online-dot"></span>
                    </div>
                )}
            </motion.button>

            {/* CHAT WINDOW */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                        className={`ai-chat-window-v2 ${isCompactDock ? 'compact-dock-window' : ''}`}
                    >
                        {/* HEADER */}
                        <div className="ai-header-v2">
                            <div className="ai-identity">
                                <div className="ai-status-avatar">
                                    <Bot size={24} />
                                    <div className="status-ring"></div>
                                </div>
                                <div className="ai-label">
                                    <h3>{isOrganizer ? 'Organizer Assistant' : 'EventSphere PRO'}</h3>
                                    <span className="ai-subtitle">{isOrganizer ? 'Business Intelligence AI' : 'Powered by AI Intelligence'}</span>
                                </div>
                            </div>
                            <div className="ai-header-controls">
                                <button className="ai-control-btn" onClick={clearChat} title="Clear Chat">
                                    <Trash2 size={16} />
                                </button>
                                <button className="ai-minimize" onClick={() => setIsOpen(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* MESSAGES */}
                        <div className="ai-chat-body-v2">
                            {messages.map(msg => (
                                <motion.div 
                                    key={msg.id} 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`ai-msg-group ${msg.sender}`}
                                >
                                    {msg.sender === 'bot' && (
                                        <div className="bot-mini-avatar"><Bot size={12} /></div>
                                    )}
                                    <div className="ai-msg-bubble">
                                        <p>{msg.text}</p>
                                        <span className="ai-msg-time">{msg.time}</span>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="ai-msg-group bot">
                                    <div className="bot-mini-avatar"><Bot size={12} /></div>
                                    <div className="ai-msg-bubble typing">
                                        <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* INTERACTIVE ACTIONS */}
                        <div className="ai-actions-area">
                            <div className="actions-header">Quick Help</div>
                            <div className="actions-scroll-v2">
                                {quickActions.map((action, i) => (
                                    <button 
                                        key={i} 
                                        className="ai-action-btn"
                                        onClick={() => action.action ? action.action() : handleSend(action.label)}
                                    >
                                        {action.icon}
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="ai-footer-v2">
                            <div className="ai-input-wrapper">
                                <input 
                                    type="text" 
                                    placeholder="Type a message..." 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button 
                                    className="ai-send-action" 
                                    onClick={() => handleSend()}
                                    disabled={!input.trim()}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIConcierge;


