import React, { useState, useEffect, useRef } from 'react';
import './SearchableUserSelect.css';

const SearchableUserSelect = ({ users, selectedUsers, onToggleUser, placeholder = "Search and select users..." }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedUserObjects = users.filter(u => selectedUsers.includes(u.id));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const removeUser = (userId, e) => {
        e.stopPropagation();
        onToggleUser(userId);
    };

    return (
        <div className="searchable-user-select" ref={dropdownRef}>
            <div className="select-input-container" onClick={() => setIsOpen(!isOpen)}>
                <div className="selected-users">
                    {selectedUserObjects.length === 0 ? (
                        <span className="placeholder">{placeholder}</span>
                    ) : (
                        selectedUserObjects.map(user => (
                            <span key={user.id} className="selected-user-tag">
                                {user.name}
                                <button
                                    className="remove-tag"
                                    onClick={(e) => removeUser(user.id, e)}
                                    type="button"
                                >
                                    ×
                                </button>
                            </span>
                        ))
                    )}
                </div>
                <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
                <div className="dropdown-panel">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search by name, email, or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>
                    <div className="user-options-list">
                        {filteredUsers.length === 0 ? (
                            <div className="no-results">No users found</div>
                        ) : (
                            filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    className={`user-option ${selectedUsers.includes(user.id) ? 'selected' : ''}`}
                                    onClick={() => onToggleUser(user.id)}
                                >
                                    <div className="user-option-avatar">
                                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="user-option-info">
                                        <div className="user-option-name">{user.name}</div>
                                        <div className="user-option-details">
                                            {user.email} • {user.department}
                                        </div>
                                    </div>
                                    {selectedUsers.includes(user.id) && (
                                        <span className="check-icon">✓</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableUserSelect;
