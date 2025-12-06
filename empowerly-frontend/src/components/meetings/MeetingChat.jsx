import React, { useState, useRef, useEffect } from 'react';
import './MeetingChat.css';

const MeetingChat = ({ messages, onSendMessage, userName }) => {
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="meeting-chat">
            <div className="chat-header">
                <h3>💬 Meeting Chat</h3>
            </div>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="chat-empty">
                        <p>No messages yet</p>
                        <p className="chat-hint">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`chat-message ${msg.userName === userName ? 'own-message' : ''}`}
                        >
                            <div className="message-header">
                                <span className="message-sender">{msg.userName}</span>
                                <span className="message-time">{formatTime(msg.timestamp)}</span>
                            </div>
                            <div className="message-content">{msg.message}</div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="chat-input"
                />
                <button type="submit" className="chat-send-btn">
                    Send
                </button>
            </form>
        </div>
    );
};

export default MeetingChat;
