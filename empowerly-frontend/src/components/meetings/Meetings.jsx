import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { meetingAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import SearchableUserSelect from '../SearchableUserSelect';
import './Meetings.css';
import './meeting-colors.css';

const Meetings = () => {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [newMeeting, setNewMeeting] = useState({
        title: '',
        description: '',
        scheduledTime: '',
        duration: 60,
        participantIds: []
    });
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        fetchMeetings();
        fetchUsers();
    }, []);

    const fetchMeetings = async () => {
        try {
            console.log('Fetching meetings...');
            const response = await meetingAPI.getAll(); // Changed from getUpcoming to getAll
            console.log('Meetings API response:', response);
            console.log('Meetings data:', response.data);
            console.log('Number of meetings:', response.data?.length);
            setMeetings(response.data || []);
        } catch (error) {
            console.error('Error fetching meetings:', error);
            console.error('Error response:', error.response);
            setMeetings([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await userAPI.getAllUsers();
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleCreateMeeting = async (e) => {
        e.preventDefault();
        try {
            // Convert datetime-local to ISO format
            const scheduledDateTime = new Date(newMeeting.scheduledTime).toISOString();

            const meetingData = {
                title: newMeeting.title,
                description: newMeeting.description,
                scheduledTime: scheduledDateTime,
                duration: newMeeting.duration,
                participantIds: selectedUsers
            };

            console.log('Creating meeting:', meetingData);
            const response = await meetingAPI.create(meetingData);
            console.log('Meeting created:', response.data);

            setShowCreateModal(false);
            resetForm();
            await fetchMeetings(); // Refresh the list
            showNotification('Meeting created successfully!', 'success');
        } catch (error) {
            console.error('Error creating meeting:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create meeting';
            showNotification(errorMessage, 'error');
        }
    };

    const handleJoinMeeting = async (meetingId) => {
        try {
            await meetingAPI.join(meetingId);
            // Navigate to meeting room
            window.location.href = `/meeting/${meetingId}`;
        } catch (error) {
            console.error('Error joining meeting:', error);
            showNotification('Failed to join meeting', 'error');
        }
    };

    const resetForm = () => {
        setNewMeeting({
            title: '',
            description: '',
            scheduledTime: '',
            duration: 60,
            participantIds: []
        });
        setSelectedUsers([]);
    };

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleClearAllMeetings = async () => {
        try {
            await meetingAPI.clearAll();
            setShowClearConfirm(false);
            await fetchMeetings();
            showNotification('All meetings cleared successfully!', 'success');
        } catch (error) {
            console.error('Error clearing meetings:', error);
            showNotification('Failed to clear meetings', 'error');
        }
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="loading">Loading meetings...</div>;
    }

    return (
        <div className="meetings-container">
            <div className="meetings-header">
                <div className="meetings-brand">
                    <h1 className="brand-title">Empowerly Connect</h1>
                    <h2>Meetings</h2>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        + New Meeting
                    </button>
                    {meetings.length > 0 && (
                        <button
                            className="btn"
                            onClick={() => setShowClearConfirm(true)}
                            style={{
                                background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(235, 51, 73, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(235, 51, 73, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(235, 51, 73, 0.3)';
                            }}
                        >
                            🗑️ Clear All
                        </button>
                    )}
                </div>
            </div>

            <div className="meetings-list">
                {meetings.length === 0 ? (
                    <div className="empty-state">
                        <p>📅 No upcoming meetings</p>
                        <p>Create a meeting to get started!</p>
                    </div>
                ) : (
                    meetings.map(meeting => (
                        <motion.div
                            key={meeting.id}
                            className="meeting-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="meeting-info">
                                <div className="meeting-header-row">
                                    <h3>{meeting.title}</h3>
                                    <span className={`meeting-status status-${meeting.status?.toLowerCase()}`}>
                                        {meeting.status || 'SCHEDULED'}
                                    </span>
                                </div>
                                <p className="meeting-description">{meeting.description}</p>
                                <div className="meeting-details">
                                    <span>🕒 {formatDateTime(meeting.scheduledTime)}</span>
                                    <span>⏱️ {meeting.duration} min</span>
                                    <span>👥 {meeting.participants?.length || 0} participants</span>
                                </div>
                                <div className="meeting-host">
                                    Host: {meeting.hostName || 'Unknown'}
                                </div>
                                <div className="meeting-link">
                                    Meeting ID: <code>{meeting.meetingLink}</code>
                                </div>
                            </div>
                            <div className="meeting-actions">
                                {meeting.status === 'IN_PROGRESS' && (
                                    <>
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleJoinMeeting(meeting.id)}
                                        >
                                            🎥 Join Now
                                        </button>
                                        {meeting.hostId === user?.id && (
                                            <button
                                                className="btn btn-danger"
                                                onClick={async () => {
                                                    try {
                                                        await meetingAPI.endMeeting(meeting.id);
                                                        fetchMeetings();
                                                    } catch (error) {
                                                        showNotification('Failed to end meeting', 'error');
                                                    }
                                                }}
                                            >
                                                🛑 End Meeting
                                            </button>
                                        )}
                                    </>
                                )}
                                {meeting.status === 'SCHEDULED' && (
                                    <>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleJoinMeeting(meeting.id)}
                                        >
                                            📹 Start Meeting
                                        </button>
                                        <button className="btn btn-secondary">
                                            📅 Scheduled
                                        </button>
                                    </>
                                )}
                                {meeting.status === 'ENDED' && (
                                    <button className="btn btn-secondary" disabled>
                                        ✅ Ended
                                    </button>
                                )}
                                {!meeting.status && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleJoinMeeting(meeting.id)}
                                    >
                                        📹 Join Meeting
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Create Meeting Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2>Create New Meeting</h2>
                            <form onSubmit={handleCreateMeeting}>
                                <div className="form-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        value={newMeeting.title}
                                        onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={newMeeting.description}
                                        onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                                        rows="3"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date & Time *</label>
                                        <input
                                            type="datetime-local"
                                            value={newMeeting.scheduledTime}
                                            onChange={(e) => setNewMeeting({ ...newMeeting, scheduledTime: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Duration (minutes) *</label>
                                        <input
                                            type="number"
                                            value={newMeeting.duration}
                                            onChange={(e) => setNewMeeting({ ...newMeeting, duration: parseInt(e.target.value) })}
                                            min="15"
                                            step="15"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Invite Participants</label>
                                    <SearchableUserSelect
                                        users={users.filter(u => u.id !== user?.id)}
                                        selectedUsers={selectedUsers}
                                        onToggleUser={toggleUserSelection}
                                        placeholder="Search and select participants..."
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Create Meeting
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Clear All Confirmation Modal */}
            <AnimatePresence>
                {showClearConfirm && (
                    <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
                        <motion.div
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                maxWidth: '500px',
                                padding: '2rem',
                                background: 'white',
                                borderRadius: '16px',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                            }}
                        >
                            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem', color: '#eb3349' }}>
                                ⚠️ Clear All Meetings?
                            </h3>
                            <p style={{ marginBottom: '1.5rem', color: '#666', lineHeight: '1.6' }}>
                                This will permanently delete all meetings you created and remove you from all meetings you're invited to. This action cannot be undone.
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
                                    onClick={handleClearAllMeetings}
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
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Meetings;
