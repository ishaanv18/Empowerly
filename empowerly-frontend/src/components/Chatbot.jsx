import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatbotAPI } from '../services/api';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hello! I\'m Sahaayak, your AI assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
        setLoading(true);

        try {
            const response = await chatbotAPI.ask(userMessage);
            setMessages(prev => [...prev, { type: 'bot', text: response.data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                type: 'bot',
                text: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chatbot-window glass"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    >
                        <div className="chatbot-header gradient-primary">
                            <div className="chatbot-header-content">
                                <span className="chatbot-icon">🤖</span>
                                <div>
                                    <h3>Sahaayak</h3>
                                    <p>AI Assistant</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="chatbot-close">
                                ✕
                            </button>
                        </div>

                        <div className="chatbot-messages">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    className={`message ${msg.type}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="message-content">
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="message bot">
                                    <div className="message-content typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chatbot-input-container">
                            <input
                                type="text"
                                className="chatbot-input"
                                placeholder="Type your message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={loading}
                            />
                            <button
                                onClick={handleSend}
                                className="chatbot-send"
                                disabled={loading || !input.trim()}
                            >
                                ➤
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                className="chatbot-toggle gradient-primary"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isOpen ? '✕' : '🤖'}
            </motion.button>
        </>
    );
};

export default Chatbot;
