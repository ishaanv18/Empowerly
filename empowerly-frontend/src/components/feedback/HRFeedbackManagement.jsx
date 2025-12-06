import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { feedbackAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import './HRFeedbackManagement.css';

const HRFeedbackManagement = () => {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, REVIEWED, RESOLVED
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [replyForm, setReplyForm] = useState({ content: '', isPublic: true });
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    useEffect(() => {
        fetchFeedback();
        fetchStatistics();
    }, []);

    const fetchFeedback = async () => {
        try {
            const response = await feedbackAPI.getAllFeedback();
            setFeedback(response.data);
        } catch (error) {
            showNotification('Failed to load feedback', 'error');
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await feedbackAPI.getStatistics();
            setStatistics(response.data);
        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
    };

    const handleAddReply = async (e) => {
        e.preventDefault();
        if (!selectedFeedback) return;

        setLoading(true);
        try {
            const apiCall = replyForm.isPublic
                ? feedbackAPI.addPublicReply
                : feedbackAPI.addPrivateReply;

            await apiCall(selectedFeedback.id, { content: replyForm.content });

            showNotification(
                `${replyForm.isPublic ? 'Public' : 'Private'} reply added successfully`,
                'success'
            );

            setReplyForm({ content: '', isPublic: true });
            setSelectedFeedback(null);
            fetchFeedback();
            fetchStatistics();
        } catch (error) {
            showNotification('Failed to add reply', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (feedbackId, newStatus) => {
        try {
            await feedbackAPI.updateStatus(feedbackId, newStatus);
            showNotification('Status updated successfully', 'success');
            fetchFeedback();
            fetchStatistics();
        } catch (error) {
            showNotification('Failed to update status', 'error');
        }
    };

    const handleClearHistory = async () => {
        setLoading(true);
        try {
            const response = await feedbackAPI.clearOldFeedback();
            showNotification(
                `Successfully cleared ${response.data.deletedCount} old feedback items`,
                'success'
            );
            fetchFeedback();
            fetchStatistics();
        } catch (error) {
            showNotification('Failed to clear old feedback', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredFeedback = () => {
        if (filter === 'ALL') return feedback;
        return feedback.filter(f => f.status === filter);
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

    const filteredFeedback = getFilteredFeedback();

    return (
        <div className="hr-feedback-container">
            <div className="feedback-header">
                <h2>💬 Feedback Management</h2>
                <p>Manage and respond to employee feedback</p>
            </div>

            {/* Statistics */}
            {statistics && (
                <div className="statistics-grid">
                    <div className="stat-card total">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <div className="stat-value">{statistics.total}</div>
                            <div className="stat-label">Total Feedback</div>
                        </div>
                    </div>
                    <div className="stat-card pending">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                            <div className="stat-value">{statistics.pending}</div>
                            <div className="stat-label">Pending</div>
                        </div>
                    </div>
                    <div className="stat-card reviewed">
                        <div className="stat-icon">👀</div>
                        <div className="stat-content">
                            <div className="stat-value">{statistics.reviewed}</div>
                            <div className="stat-label">Reviewed</div>
                        </div>
                    </div>
                    <div className="stat-card resolved">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <div className="stat-value">{statistics.resolved}</div>
                            <div className="stat-label">Resolved</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filter-section">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
                            onClick={() => setFilter('ALL')}
                        >
                            All ({feedback.length})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'PENDING' ? 'active' : ''}`}
                            onClick={() => setFilter('PENDING')}
                        >
                            Pending ({feedback.filter(f => f.status === 'PENDING').length})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'REVIEWED' ? 'active' : ''}`}
                            onClick={() => setFilter('REVIEWED')}
                        >
                            Reviewed ({feedback.filter(f => f.status === 'REVIEWED').length})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'RESOLVED' ? 'active' : ''}`}
                            onClick={() => setFilter('RESOLVED')}
                        >
                            Resolved ({feedback.filter(f => f.status === 'RESOLVED').length})
                        </button>
                    </div>
                    <button
                        className="btn-clear-history"
                        onClick={() => setShowClearConfirm(true)}
                        style={{
                            marginLeft: 'auto',
                            padding: '0.5rem 1rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        🗑️ Clear Old History
                    </button>
                </div>
            </div>

            {/* Feedback List */}
            <div className="feedback-list">
                {filteredFeedback.length === 0 ? (
                    <div className="empty-state card">
                        <p>No feedback found</p>
                    </div>
                ) : (
                    filteredFeedback.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="feedback-card card"
                        >
                            <div className="feedback-header-row">
                                <div className="feedback-title-section">
                                    <h3>{item.subject}</h3>
                                    <div className="feedback-meta">
                                        <span className="category-badge">{item.category}</span>
                                        <span className="date">{formatDate(item.submittedAt)}</span>
                                        <span className="token">Token: {item.anonymousToken}</span>
                                    </div>
                                </div>
                                {getStatusBadge(item.status)}
                            </div>

                            <div className="feedback-content">
                                <p>{item.content}</p>
                            </div>

                            {/* Existing Replies */}
                            {item.publicReplies && item.publicReplies.length > 0 && (
                                <div className="replies-section">
                                    <h4>🌐 Public Replies:</h4>
                                    {item.publicReplies.map((reply, index) => (
                                        <div key={index} className="reply-item public">
                                            <div className="reply-header">
                                                <strong>{reply.repliedBy}</strong>
                                                <span>{formatDate(reply.repliedAt)}</span>
                                            </div>
                                            <p>{reply.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {item.privateReply && (
                                <div className="replies-section">
                                    <h4>🔒 Private Reply:</h4>
                                    <div className="reply-item private">
                                        <div className="reply-header">
                                            <strong>{item.privateReply.repliedBy}</strong>
                                            <span>{formatDate(item.privateReply.repliedAt)}</span>
                                        </div>
                                        <p>{item.privateReply.content}</p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="feedback-actions">
                                <button
                                    className="btn-reply"
                                    onClick={() => setSelectedFeedback(item)}
                                >
                                    💬 Add Reply
                                </button>

                                {item.status !== 'RESOLVED' && (
                                    <button
                                        className="btn-status"
                                        onClick={() => handleUpdateStatus(
                                            item.id,
                                            item.status === 'PENDING' ? 'REVIEWED' : 'RESOLVED'
                                        )}
                                    >
                                        {item.status === 'PENDING' ? '👀 Mark Reviewed' : '✅ Mark Resolved'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Reply Modal */}
            {selectedFeedback && (
                <div className="modal-overlay" onClick={() => setSelectedFeedback(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>Add Reply</h3>
                            <button className="btn-close" onClick={() => setSelectedFeedback(null)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="feedback-summary">
                                <strong>Subject:</strong> {selectedFeedback.subject}
                            </div>

                            <form onSubmit={handleAddReply}>
                                <div className="form-group">
                                    <label>Reply Type</label>
                                    <div className="reply-type-selector">
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                checked={replyForm.isPublic}
                                                onChange={() => setReplyForm({ ...replyForm, isPublic: true })}
                                            />
                                            <span>🌐 Public (visible to all employees)</span>
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                checked={!replyForm.isPublic}
                                                onChange={() => setReplyForm({ ...replyForm, isPublic: false })}
                                            />
                                            <span>🔒 Private (only to submitter)</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Your Reply *</label>
                                    <textarea
                                        value={replyForm.content}
                                        onChange={(e) => setReplyForm({ ...replyForm, content: e.target.value })}
                                        placeholder="Type your reply here..."
                                        rows="5"
                                        required
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => setSelectedFeedback(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit" disabled={loading}>
                                        {loading ? 'Sending...' : '📤 Send Reply'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Clear History Confirmation Modal */}
            {showClearConfirm && (
                <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '500px' }}
                    >
                        <div className="modal-header">
                            <h3>⚠️ Confirm Clear History</h3>
                            <button className="btn-close" onClick={() => setShowClearConfirm(false)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
                                Are you sure you want to clear all feedback older than 24 hours?
                            </p>
                            <div style={{
                                background: '#fef2f2',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                marginBottom: '1rem'
                            }}>
                                <strong style={{ color: '#dc2626' }}>⚠️ Warning:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', color: '#7f1d1d', fontSize: '0.875rem' }}>
                                    This action cannot be undone. Only feedback older than 24 hours will be permanently deleted.
                                </p>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowClearConfirm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn-submit"
                                    onClick={() => {
                                        setShowClearConfirm(false);
                                        handleClearHistory();
                                    }}
                                    disabled={loading}
                                    style={{ background: '#ef4444' }}
                                >
                                    {loading ? 'Clearing...' : '🗑️ Clear History'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default HRFeedbackManagement;
