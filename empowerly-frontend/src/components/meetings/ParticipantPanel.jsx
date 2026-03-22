import React, { useState } from 'react';
import { userAPI } from '../../services/api';
import SearchableUserSelect from '../SearchableUserSelect';
import './ParticipantPanel.css';

const ParticipantPanel = ({ participants, meetingId, onInviteParticipants }) => {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleOpenInvite = async () => {
        setLoading(true);
        try {
            const response = await userAPI.getAllUsers();
            // Filter out already invited participants
            const participantIds = participants.map(p => p.userId);
            const availableUsers = response.data.filter(u => !participantIds.includes(u.id));
            setUsers(availableUsers);
            setShowInviteModal(true);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleInvite = () => {
        if (selectedUsers.length > 0) {
            onInviteParticipants(selectedUsers);
            setSelectedUsers([]);
            setShowInviteModal(false);
        }
    };

    return (
        <div className="participant-panel">
            <div className="panel-header">
                <h3>Participants ({participants.length})</h3>
                <button className="add-btn" onClick={handleOpenInvite} disabled={loading}>
                    + Add
                </button>
            </div>

            <div className="participants-list">
                {participants.map((participant) => (
                    <div key={participant.userId} className="participant-item">
                        <div className="participant-avatar">
                            {participant.userName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="participant-info">
                            <span className="participant-name">{participant.userName}</span>
                            <span className={`participant-status status-${participant.status?.toLowerCase()}`}>
                                {participant.status || 'INVITED'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {showInviteModal && (
                <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Invite Participants</h3>
                        {users.length === 0 ? (
                            <p className="no-users">All users have been invited</p>
                        ) : (
                            <SearchableUserSelect
                                users={users}
                                selectedUsers={selectedUsers}
                                onToggleUser={toggleUserSelection}
                                placeholder="Search and select users to invite..."
                            />
                        )}
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowInviteModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleInvite}
                                disabled={selectedUsers.length === 0}
                            >
                                Invite ({selectedUsers.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParticipantPanel;
