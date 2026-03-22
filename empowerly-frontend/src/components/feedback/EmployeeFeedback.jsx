import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { feedbackAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import './EmployeeFeedback.css';

const EmployeeFeedback = () => {
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('submit'); // submit, track, public
    const [loading, setLoading] = useState(false);

    // Submit form state
    const [feedbackForm, setFeedbackForm] = useState({
        subject: '',
        content: '',
        category: 'OTHER'
    });
    const [submittedToken, setSubmittedToken] = useState(null);

    // Track form state
    const [trackToken, setTrackToken] = useState('');
    const [trackedFeedback, setTrackedFeedback] = useState(null);

    // Public feedback state
    const [publicFeedback, setPublicFeedback] = useState([]);

    useEffect(() => {
        if (activeTab === 'public') {
            fetchPublicFeedback();
        }
    }, [activeTab]);

    const fetchPublicFeedback = async () => {
        try {
            const response = await feedbackAPI.getPublicFeedback();
            setPublicFeedback(response.data);
        } catch (error) {
            console.error('Error fetching public feedback:', error);
            setPublicFeedback([]);
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await feedbackAPI.submitFeedback(feedbackForm);
            setSubmittedToken(response.data.anonymousToken);
            showNotification('Feedback submitted successfully! Save your tracking token.', 'success');

            // Reset form
            setFeedbackForm({
                subject: '',
                content: '',
                category: 'OTHER'
            });
        } catch (error) {
            showNotification('Failed to submit feedback', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTrackFeedback = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await feedbackAPI.getFeedbackByToken(trackToken);
            setTrackedFeedback(response.data);
        } catch (error) {
            showNotification('Feedback not found with this token', 'error');
            setTrackedFeedback(null);
        } finally {
            setLoading(false);
        }
    };

    const copyToken = (token) => {
        navigator.clipboard.writeText(token);
        showNotification('Token copied to clipboard!', 'success');
    };

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: { class: 'status-pending', text: 'Pending' },
            REVIEWED: { class: 'status-reviewed', text: 'Reviewed' },
            RESOLVED: { class: 'status-resolved', text: 'Resolved' }
        };
        const badge = badges[status] || badges.PENDING;
        return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="employee-feedback-container">
            <div className="feedback-header">
                <h2>💬 Anonymous Feedback</h2>
                <p>Share your thoughts and concerns anonymously</p>
            </div>

            {/* Tab Navigation */}
            <div className="feedback-tabs">
                <button
                    className={`tab-btn ${activeTab === 'submit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('submit')}
                >
                    📝 Submit Feedback
                </button>
                <button
                    className={`tab-btn ${activeTab === 'track' ? 'active' : ''}`}
                    onClick={() => setActiveTab('track')}
                >
                    🔍 Track Feedback
                </button>
                <button
                    className={`tab-btn ${activeTab === 'public' ? 'active' : ''}`}
                    onClick={() => setActiveTab('public')}
                >
                    🌐 Public Feedback
                </button>
            </div>

            {/* Submit Feedback Tab */}
            {activeTab === 'submit' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="feedback-content"
                >
                    {submittedToken ? (
                        <div className="token-display card">
                            <h3>✅ Feedback Submitted Successfully!</h3>
                            <p>Save this token to track your feedback:</p>
                            <div className="token-box">
                                <code>{submittedToken}</code>
                                <button onClick={() => copyToken(submittedToken)} className="btn-copy">
                                    📋 Copy
                                </button>
                            </div>
                            <div className="info-notice" style={{
                                background: '#dbeafe',
                                border: '1px solid #3b82f6',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                marginTop: '1rem',
                                fontSize: '0.875rem',
                                color: '#1e40af'
                            }}>
                                ⏰ <strong>Important:</strong> You can track this feedback for the next 24 hours. After that, it will be archived, but HR can still respond.
                            </div>
                            <div className="info-notice" style={{
                                background: '#dbeafe',
                                border: '1px solid #3b82f6',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                marginTop: '1rem',
                                fontSize: '0.875rem',
                                color: '#1e40af'
                            }}>
                                ⏰ <strong>Important:</strong> You can track this feedback for the next 24 hours. After that, it will be archived, but HR can still respond.
                            </div>
                            <button
                                onClick={() => setSubmittedToken(null)}
                                className="btn-submit-another"
                            >
                                Submit Another Feedback
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitFeedback} className="feedback-form card">
                            <div className="form-group">
                                <label>Subject *</label>
                                <input
                                    type="text"
                                    value={feedbackForm.subject}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, subject: e.target.value })}
                                    placeholder="Brief summary of your feedback"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={feedbackForm.category}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
                                >
                                    <option value="WORKPLACE">Workplace Environment</option>
                                    <option value="BENEFITS">Benefits & Compensation</option>
                                    <option value="MANAGEMENT">Management & Leadership</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Your Feedback *</label>
                                <textarea
                                    value={feedbackForm.content}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, content: e.target.value })}
                                    placeholder="Share your thoughts, concerns, or suggestions..."
                                    rows="6"
                                    required
                                />
                            </div>

                            <div className="privacy-notice">
                                🔒 Your feedback is completely anonymous. No personal information will be stored.
                            </div>

                            <div className="info-notice" style={{
                                background: '#dbeafe',
                                border: '1px solid #3b82f6',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                marginTop: '1rem',
                                fontSize: '0.875rem',
                                color: '#1e40af'
                            }}>
                                ℹ️ <strong>Note:</strong> Your feedback will be visible to you for 24 hours. After that, it will be archived but HR will still have access to respond.
                            </div>

                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Submitting...' : '📤 Submit Feedback'}
                            </button>
                        </form>
                    )}
                </motion.div>
            )}

            {/* Track Feedback Tab */}
            {activeTab === 'track' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="feedback-content"
                >
                    <form onSubmit={handleTrackFeedback} className="track-form card">
                        <h3>Track Your Feedback</h3>
                        <p>Enter your tracking token to see the status and any replies</p>

                        <div className="info-notice" style={{
                            background: '#fef3c7',
                            border: '1px solid #f59e0b',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            marginBottom: '1rem',
                            fontSize: '0.875rem',
                            color: '#92400e'
                        }}>
                            ⏰ <strong>Reminder:</strong> Feedback is visible for 24 hours after submission. Save your token to track it during this time.
                        </div>

                        <div className="token-input-group">
                            <input
                                type="text"
                                value={trackToken}
                                onChange={(e) => setTrackToken(e.target.value.toUpperCase())}
                                placeholder="Enter your tracking token"
                                required
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? 'Searching...' : '🔍 Track'}
                            </button>
                        </div>
                    </form>

                    {trackedFeedback && (
                        <div className="tracked-feedback card">
                            <div className="feedback-header-row">
                                <h3>{trackedFeedback.subject}</h3>
                                {getStatusBadge(trackedFeedback.status)}
                            </div>
                            <div className="feedback-meta">
                                <span className="category-badge">{trackedFeedback.category}</span>
                                <span className="date">{formatDate(trackedFeedback.submittedAt)}</span>
                            </div>
                            <div className="feedback-content-box">
                                <p>{trackedFeedback.content}</p>
                            </div>

                            {/* Private Reply */}
                            {trackedFeedback.privateReply && (
                                <div className="reply-section private-reply">
                                    <h4>🔒 Private Reply from HR</h4>
                                    <div className="reply-box">
                                        <div className="reply-header">
                                            <strong>{trackedFeedback.privateReply.repliedBy}</strong>
                                            <span className="reply-date">
                                                {formatDate(trackedFeedback.privateReply.repliedAt)}
                                            </span>
                                        </div>
                                        <p>{trackedFeedback.privateReply.content}</p>
                                    </div>
                                </div>
                            )}

                            {/* Public Replies */}
                            {trackedFeedback.publicReplies && trackedFeedback.publicReplies.length > 0 && (
                                <div className="reply-section public-replies">
                                    <h4>🌐 Public Replies</h4>
                                    {trackedFeedback.publicReplies.map((reply, index) => (
                                        <div key={index} className="reply-box">
                                            <div className="reply-header">
                                                <strong>{reply.repliedBy}</strong>
                                                <span className="reply-date">{formatDate(reply.repliedAt)}</span>
                                            </div>
                                            <p>{reply.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Public Feedback Tab */}
            {activeTab === 'public' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="feedback-content"
                >
                    <div className="public-feedback-list">
                        {publicFeedback.length === 0 ? (
                            <div className="empty-state card">
                                <h3>📢 Public Feedback & Announcements</h3>
                                <p style={{ marginTop: '1rem', color: '#6b7280' }}>
                                    When HR responds publicly to feedback, those responses will appear here for all employees to see.
                                </p>
                                <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
                                    This helps share important updates and responses with the entire team.
                                </p>
                                <p style={{ marginTop: '1rem', fontStyle: 'italic', color: '#9ca3af' }}>
                                    No public announcements at this time.
                                </p>
                            </div>
                        ) : (
                            publicFeedback.map((feedback) => (
                                <div key={feedback.id} className="public-feedback-item card">
                                    <div className="feedback-header-row">
                                        <h3>{feedback.subject}</h3>
                                        {getStatusBadge(feedback.status)}
                                    </div>
                                    <div className="feedback-meta">
                                        <span className="category-badge">{feedback.category}</span>
                                        <span className="date">{formatDate(feedback.submittedAt)}</span>
                                    </div>
                                    <div className="feedback-content-box">
                                        <p>{feedback.content}</p>
                                    </div>

                                    {/* Public Replies */}
                                    <div className="reply-section public-replies">
                                        <h4>🌐 HR Responses:</h4>
                                        {feedback.publicReplies.map((reply, index) => (
                                            <div key={index} className="reply-box">
                                                <div className="reply-header">
                                                    <strong>{reply.repliedBy}</strong>
                                                    <span className="reply-date">{formatDate(reply.repliedAt)}</span>
                                                </div>
                                                <p>{reply.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default EmployeeFeedback;
