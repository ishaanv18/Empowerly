import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import './HRUserManagement.css';

const HRUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');

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

    const fetchUserDetails = async (userId) => {
        try {
            setLoading(true);

            // Fetch user basic info
            const userResponse = await api.get(`/users/${userId}`);
            const user = userResponse.data;

            // Fetch salary structure
            let salaryStructure = null;
            try {
                const salaryResponse = await api.get(`/payroll/salary-structure/${userId}`);
                salaryStructure = salaryResponse.data;
            } catch (err) {
                console.log('No salary structure found');
            }

            // Fetch recent payslips
            let payslips = [];
            try {
                const payslipResponse = await api.get(`/payroll/payslips/${userId}`);
                payslips = payslipResponse.data.slice(0, 3); // Last 3 payslips
            } catch (err) {
                console.log('No payslips found');
            }

            setUserDetails({
                ...user,
                salaryStructure,
                payslips
            });
            setShowDetailsModal(true);
        } catch (error) {
            console.error('Failed to fetch user details:', error);
            alert('Failed to load user details');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        fetchUserDetails(user.id);
    };

    const closeModal = () => {
        setShowDetailsModal(false);
        setSelectedUser(null);
        setUserDetails(null);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'ALL' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    if (loading && users.length === 0) {
        return <div className="loading">Loading users...</div>;
    }

    return (
        <div className="hr-user-management">
            <div className="management-header">
                <h1>👥 User Management</h1>
                <p>View detailed information about all users in the system</p>
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
                            <th>Phone</th>
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
                                <td>{user.phoneNumber || 'N/A'}</td>
                                <td>
                                    <button
                                        className="btn-view-details"
                                        onClick={() => handleViewDetails(user)}
                                    >
                                        View Details
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

            {/* User Details Modal */}
            {showDetailsModal && userDetails && (
                <div className="modal-overlay" onClick={closeModal}>
                    <motion.div
                        className="modal-content user-details-modal"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="modal-header">
                            <h2>👤 User Details</h2>
                            <button className="close-btn" onClick={closeModal}>✕</button>
                        </div>

                        <div className="modal-body">
                            {/* Personal Information */}
                            <div className="details-section">
                                <h3>📋 Personal Information</h3>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <label>Full Name:</label>
                                        <span>{userDetails.name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email:</label>
                                        <span>{userDetails.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Phone Number:</label>
                                        <span>{userDetails.phoneNumber || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Date of Birth:</label>
                                        <span>{formatDate(userDetails.dateOfBirth)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Department:</label>
                                        <span>{userDetails.department || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Role:</label>
                                        <span className={`role-badge role-${userDetails.role.toLowerCase()}`}>
                                            {userDetails.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Salary Structure */}
                            {userDetails.salaryStructure && (
                                <div className="details-section">
                                    <h3>💰 Salary Structure</h3>
                                    <div className="salary-details">
                                        <div className="salary-row">
                                            <span>Basic Salary:</span>
                                            <strong>{formatCurrency(userDetails.salaryStructure.basicSalary)}</strong>
                                        </div>
                                        <div className="salary-row">
                                            <span>HRA:</span>
                                            <strong>{formatCurrency(userDetails.salaryStructure.hra)}</strong>
                                        </div>
                                        <div className="salary-row">
                                            <span>DA:</span>
                                            <strong>{formatCurrency(userDetails.salaryStructure.da)}</strong>
                                        </div>
                                        <div className="salary-row">
                                            <span>Travel Allowance:</span>
                                            <strong>{formatCurrency(userDetails.salaryStructure.travelAllowance)}</strong>
                                        </div>
                                        <div className="salary-row">
                                            <span>Medical Allowance:</span>
                                            <strong>{formatCurrency(userDetails.salaryStructure.medicalAllowance)}</strong>
                                        </div>
                                        <div className="salary-row total">
                                            <span>Gross Salary:</span>
                                            <strong>
                                                {formatCurrency(
                                                    userDetails.salaryStructure.basicSalary +
                                                    userDetails.salaryStructure.hra +
                                                    userDetails.salaryStructure.da +
                                                    userDetails.salaryStructure.travelAllowance +
                                                    userDetails.salaryStructure.medicalAllowance +
                                                    (userDetails.salaryStructure.otherAllowances || 0)
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!userDetails.salaryStructure && (
                                <div className="details-section">
                                    <h3>💰 Salary Structure</h3>
                                    <p className="no-data">No salary structure configured</p>
                                </div>
                            )}

                            {/* Recent Payslips */}
                            {userDetails.payslips && userDetails.payslips.length > 0 && (
                                <div className="details-section">
                                    <h3>📄 Recent Payslips</h3>
                                    <div className="payslips-list">
                                        {userDetails.payslips.map((payslip, index) => (
                                            <div key={index} className="payslip-item">
                                                <div className="payslip-info">
                                                    <span className="payslip-month">
                                                        {payslip.month}/{payslip.year}
                                                    </span>
                                                    <span className="payslip-amount">
                                                        {formatCurrency(payslip.netSalary)}
                                                    </span>
                                                </div>
                                                <span className={`payslip-status status-${payslip.status.toLowerCase()}`}>
                                                    {payslip.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default HRUserManagement;
