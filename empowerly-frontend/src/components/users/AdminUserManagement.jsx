import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import './AdminUserManagement.css';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        try {
            await api.delete(`/users/${userToDelete.id}`);
            alert(`User "${userToDelete.name}" has been deleted successfully`);
            setShowDeleteModal(false);
            setUserToDelete(null);
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user. Please try again.');
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setUserToDelete(null);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'ALL' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    return (
        <div className="admin-user-management">
            <div className="management-header">
                <h1>⚙️ User Management</h1>
                <p>Manage all users in the system - Remove users as needed</p>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="role-filter">
                    <label>Filter by Role:</label>
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                        <option value="ALL">All Roles</option>
                        <option value="EMPLOYEE">Employee</option>
                        <option value="HR">HR</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
            </div>

            <div className="users-stats">
                <div className="stat-card">
                    <span className="stat-icon">👤</span>
                    <div className="stat-info">
                        <h3>{users.length}</h3>
                        <p>Total Users</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">👔</span>
                    <div className="stat-info">
                        <h3>{users.filter(u => u.role === 'EMPLOYEE').length}</h3>
                        <p>Employees</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🎯</span>
                    <div className="stat-info">
                        <h3>{users.filter(u => u.role === 'HR').length}</h3>
                        <p>HR Staff</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">⚙️</span>
                    <div className="stat-info">
                        <h3>{users.filter(u => u.role === 'ADMIN').length}</h3>
                        <p>Admins</p>
                    </div>
                </div>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <motion.tr
                                key={user.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td>
                                    <div className="user-name-cell">
                                        <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                                        <span>{user.name}</span>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>{user.department || 'N/A'}</td>
                                <td>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteClick(user)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="no-users">
                        <p>No users found matching your criteria</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && userToDelete && (
                <div className="modal-overlay" onClick={cancelDelete}>
                    <motion.div
                        className="modal-content delete-modal"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="modal-header delete-header">
                            <h2>⚠️ Confirm Delete</h2>
                        </div>

                        <div className="modal-body">
                            <p className="delete-warning">
                                Are you sure you want to delete this user?
                            </p>
                            <div className="user-delete-info">
                                <div className="info-row">
                                    <strong>Name:</strong>
                                    <span>{userToDelete.name}</span>
                                </div>
                                <div className="info-row">
                                    <strong>Email:</strong>
                                    <span>{userToDelete.email}</span>
                                </div>
                                <div className="info-row">
                                    <strong>Role:</strong>
                                    <span className={`role-badge role-${userToDelete.role.toLowerCase()}`}>
                                        {userToDelete.role}
                                    </span>
                                </div>
                            </div>
                            <p className="delete-note">
                                ⚠️ This action cannot be undone. All data associated with this user will be permanently deleted.
                            </p>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={cancelDelete}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={confirmDelete}>
                                Delete User
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;
