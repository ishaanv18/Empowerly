import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Chat.css';

const Chat = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [contextMenu, setContextMenu] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const messagesEndRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        fetchUnreadCount();

        // Poll for new messages every 5 seconds
        const interval = setInterval(() => {
            if (selectedConversation && selectedConversation.id) {
                fetchMessages(selectedConversation.id);
            }
            fetchConversations();
            fetchUnreadCount();
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Debounce search
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (searchQuery.trim()) {
            searchTimeoutRef.current = setTimeout(() => {
                searchUsers();
            }, 300);
        } else {
            setSearchResults([]);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        if (contextMenu) {
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [contextMenu]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const response = await chatAPI.getConversations();
            setConversations(response.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const response = await chatAPI.getMessages(conversationId);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await chatAPI.getUnreadCount();
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const searchUsers = async () => {
        try {
            const response = await userAPI.searchUsers(searchQuery);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const handleSelectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        setShowUserSearch(false);
        await fetchMessages(conversation.id);

        // Mark as read
        if (conversation.unreadCount > 0) {
            await chatAPI.markAsRead(conversation.id);
            fetchConversations();
            fetchUnreadCount();
        }
    };

    const handleSelectUser = async (selectedUser) => {
        setLoading(true);
        try {
            // Check if conversation already exists
            const response = await chatAPI.getConversations();
            const existingConv = response.data.find(c => c.otherUserId === selectedUser.id);

            if (existingConv) {
                // Conversation exists, just select it
                handleSelectConversation(existingConv);
            } else {
                // Create a new conversation placeholder
                setSelectedConversation({
                    id: null,
                    otherUserId: selectedUser.id,
                    otherUserName: selectedUser.name,
                    otherUserEmail: selectedUser.email,
                    otherUserDepartment: selectedUser.department,
                    lastMessage: null,
                    lastMessageTime: new Date(),
                    unreadCount: 0
                });
                setMessages([]);
            }

            setShowUserSearch(false);
            setSearchQuery('');
        } catch (error) {
            console.error('Error selecting user:', error);
            alert('Failed to start conversation');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        setLoading(true);
        try {
            await chatAPI.sendMessage(selectedConversation.otherUserId, newMessage);
            setNewMessage('');

            // Refresh conversations to get the new one if it was just created
            await fetchConversations();

            // If this was a new conversation (no id), find it now
            if (!selectedConversation.id) {
                const response = await chatAPI.getConversations();
                const newConv = response.data.find(c => c.otherUserId === selectedConversation.otherUserId);
                if (newConv) {
                    setSelectedConversation(newConv);
                    await fetchMessages(newConv.id);
                }
            } else {
                await fetchMessages(selectedConversation.id);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const handleMessageRightClick = (e, msg) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            message: msg
        });
    };

    const handleDeleteForMe = async () => {
        if (!contextMenu?.message) return;
        try {
            await chatAPI.deleteMessageForMe(contextMenu.message.id);
            setContextMenu(null);
            if (selectedConversation?.id) {
                await fetchMessages(selectedConversation.id);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message');
        }
    };

    const handleDeleteForEveryone = async () => {
        if (!contextMenu?.message) return;
        try {
            await chatAPI.deleteMessageForEveryone(contextMenu.message.id);
            setContextMenu(null);
            if (selectedConversation?.id) {
                await fetchMessages(selectedConversation.id);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            alert(error.response?.data?.error || 'Failed to delete message');
        }
    };

    const handleClearAllChats = async () => {
        try {
            await chatAPI.clearAllChats();
            setShowClearConfirm(false);
            setMessages([]);
            setSelectedConversation(null);
            setConversations([]);
            await fetchConversations();
        } catch (error) {
            console.error('Error clearing chats:', error);
            alert('Failed to clear chats');
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="chat-container">
            {/* Left Panel - Conversations */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <h3>Messages</h3>
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                    )}
                </div>

                <button
                    className="btn btn-primary btn-full new-chat-btn"
                    onClick={() => setShowUserSearch(!showUserSearch)}
                >
                    ➕ New Chat
                </button>

                {conversations.length > 0 && (
                    <button
                        className="btn new-chat-btn"
                        onClick={() => setShowClearConfirm(true)}
                        style={{
                            marginTop: '0.5rem',
                            background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                            color: 'white',
                            border: 'none'
                        }}
                    >
                        🗑️ Clear All Chats
                    </button>
                )}

                {showUserSearch && (
                    <div className="user-search-panel">
                        <input
                            type="text"
                            className="input-field search-input"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />

                        <div className="search-results">
                            {searchResults.length > 0 ? (
                                searchResults.map(u => (
                                    <div
                                        key={u.id}
                                        className="user-result-item"
                                        onClick={() => handleSelectUser(u)}
                                    >
                                        <div className="user-avatar">
                                            {getInitials(u.name)}
                                        </div>
                                        <div className="user-info">
                                            <div className="user-name">{u.name}</div>
                                            <div className="user-dept">{u.department}</div>
                                        </div>
                                    </div>
                                ))
                            ) : searchQuery.trim() ? (
                                <div className="empty-state">No users found</div>
                            ) : (
                                <div className="empty-state">Type to search users</div>
                            )}
                        </div>
                    </div>
                )}

                <div className="conversations-list">
                    {conversations.length > 0 ? (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                                onClick={() => handleSelectConversation(conv)}
                            >
                                <div className="user-avatar">
                                    {getInitials(conv.otherUserName)}
                                </div>
                                <div className="conversation-info">
                                    <div className="conversation-header">
                                        <span className="conversation-name">{conv.otherUserName}</span>
                                        <span className="conversation-time">
                                            {formatTime(conv.lastMessageTime)}
                                        </span>
                                    </div>
                                    <div className="conversation-preview">
                                        {conv.lastMessage || 'No messages yet'}
                                    </div>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <span className="conversation-unread">{conv.unreadCount}</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>No conversations yet</p>
                            <p>Click "New Chat" to start messaging!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Chat Window */}
            <div className="chat-main">
                {selectedConversation ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-header-user">
                                <div className="user-avatar">
                                    {getInitials(selectedConversation.otherUserName)}
                                </div>
                                <div>
                                    <div className="chat-header-name">{selectedConversation.otherUserName}</div>
                                    <div className="chat-header-dept">{selectedConversation.otherUserDepartment}</div>
                                </div>
                            </div>
                        </div>

                        <div className="messages-container">
                            {messages.length > 0 ? (
                                <AnimatePresence>
                                    {messages.map((msg, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`message-bubble ${msg.senderId === user.id ? 'sent' : 'received'}`}
                                            onContextMenu={(e) => handleMessageRightClick(e, msg)}
                                            style={{ cursor: 'context-menu' }}
                                        >
                                            {msg.content}
                                            <div className="message-time">
                                                {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            ) : (
                                <div className="empty-state">
                                    <p>No messages yet</p>
                                    <p>Start the conversation!</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="message-input-container" onSubmit={handleSendMessage}>
                            <textarea
                                className="message-input"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                rows="1"
                            />
                            <button
                                type="submit"
                                className="btn btn-primary send-btn"
                                disabled={!newMessage.trim() || loading}
                            >
                                ➤
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="chat-empty-state">
                        <div className="empty-icon">💬</div>
                        <h3>Select a conversation</h3>
                        <p>Choose a conversation from the list or start a new chat</p>
                    </div>
                )}
            </div>

            {/* Context Menu for Message Deletion */}
            {contextMenu && (
                <div
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        background: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        minWidth: '200px'
                    }}
                >
                    <button
                        onClick={handleDeleteForMe}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                    >
                        🗑️ Delete for Me
                    </button>
                    {contextMenu.message.senderId === user.id && (
                        <button
                            onClick={handleDeleteForEveryone}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: 'none',
                                background: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: '#eb3349'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                        >
                            ❌ Delete for Everyone
                        </button>
                    )}
                </div>
            )}

            {/* Clear All Chats Confirmation Modal */}
            {showClearConfirm && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setShowClearConfirm(false)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            maxWidth: '500px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem', color: '#eb3349' }}>
                            ⚠️ Clear All Chats?
                        </h3>
                        <p style={{ marginBottom: '1.5rem', color: '#666', lineHeight: '1.6' }}>
                            This will delete all your chat messages from all conversations. This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: '2px solid #ddd',
                                    background: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearAllChats}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(235, 51, 73, 0.3)'
                                }}
                            >
                                Yes, Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
