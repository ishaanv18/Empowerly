import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI, leaveAPI, chatAPI, adminAPI } from '../../services/api';
import Chat from '../../components/chat/Chat';
import Meetings from '../../components/meetings/Meetings';
import ConfirmDialog from '../../components/ConfirmDialog';
import AdminNavigation from '../../components/navigation/AdminNavigation';
import ApplyForReview from '../../components/performance/ApplyForReview';
import ViewMyReviews from '../../components/performance/ViewMyReviews';
import AdminPayrollApproval from '../../components/payroll/AdminPayrollApproval';
import SalaryStructureManager from '../../components/payroll/SalaryStructureManager';
import EmployeePayslips from '../../components/payroll/EmployeePayslips';
import AdminUserManagement from '../../components/users/AdminUserManagement';
import './Dashboard.css';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('overview');
    const [chatUnreadCount, setChatUnreadCount] = useState(0);

    // Admin-specific state
    const [allEmployeesAttendance, setAllEmployeesAttendance] = useState([]);
    const [allLeaves, setAllLeaves] = useState([]);
    const [systemStats, setSystemStats] = useState({
        totalUsers: 0,
        totalEmployees: 0,
        totalHR: 0,
        totalAdmins: 0,
        activeToday: 0,
        pendingLeaves: 0
    });

    // Personal attendance state
    const [attendanceStatus, setAttendanceStatus] = useState('CHECKED_OUT');
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [myAttendanceHistory, setMyAttendanceHistory] = useState([]);
    const [myLeaves, setMyLeaves] = useState([]);
    const [loading, setLoading] = useState(false);

    // Leave balance and application state
    const [leaveBalance, setLeaveBalance] = useState(null);
    const [showLeaveForm, setShowLeaveForm] = useState(false);
    const [leaveForm, setLeaveForm] = useState({
        leaveType: 'CASUAL_LEAVE',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, leaveId: null });

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchAdminData();
            fetchMyAttendance();
            fetchMyLeaves();
            fetchLeaveBalance();
            fetchChatUnreadCount();
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'all-attendance') {
            fetchAllEmployeesAttendance();
        } else if (activeTab === 'all-leaves') {
            fetchAllLeaves();
        }
    }, [activeTab]);

    const fetchAdminData = async () => {
        try {
            const response = await adminAPI.getStats();
            setSystemStats({
                totalUsers: response.data.totalUsers,
                totalEmployees: response.data.totalEmployees,
                totalHR: response.data.totalHR,
                totalAdmins: response.data.totalAdmins,
                activeToday: response.data.activeToday,
                pendingLeaves: 0
            });
        } catch (error) {
            console.error('Error fetching admin data:', error);
        }
    };

    const fetchMyAttendance = async () => {
        try {
            const [todayResponse, historyResponse] = await Promise.all([
                attendanceAPI.getTodayAttendance(),
                attendanceAPI.getMyAttendance()
            ]);

            if (todayResponse.data) {
                setTodayAttendance(todayResponse.data);
                setAttendanceStatus(todayResponse.data.status);
            }

            setMyAttendanceHistory(historyResponse.data || []);
        } catch (error) {
            console.error('Error fetching my attendance:', error);
        }
    };

    const fetchMyLeaves = async () => {
        try {
            const response = await leaveAPI.getMyLeaves();
            setMyLeaves(response.data || []);
        } catch (error) {
            console.error('Error fetching my leaves:', error);
        }
    };

    const fetchLeaveBalance = async () => {
        try {
            const response = await leaveAPI.getBalance();
            setLeaveBalance(response.data);
        } catch (error) {
            console.error('Error fetching leave balance:', error);
        }
    };

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await leaveAPI.apply(leaveForm);
            setShowLeaveForm(false);
            setLeaveForm({ leaveType: 'CASUAL_LEAVE', startDate: '', endDate: '', reason: '' });
            await fetchMyLeaves();
            await fetchLeaveBalance();
            showNotification('Leave application submitted successfully!', 'success');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to submit leave request';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeLeave = async (leaveId) => {
        setConfirmDialog({ isOpen: true, leaveId });
    };

    const confirmRevokeLeave = async () => {
        const leaveId = confirmDialog.leaveId;
        setConfirmDialog({ isOpen: false, leaveId: null });

        try {
            setLoading(true);
            await leaveAPI.revoke(leaveId);
            await fetchMyLeaves();
            await fetchLeaveBalance();
            showNotification('Leave request cancelled successfully!', 'success');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to cancel leave request';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchChatUnreadCount = async () => {
        try {
            const response = await chatAPI.getUnreadCount();
            setChatUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const fetchAllEmployeesAttendance = async () => {
        try {
            const response = await attendanceAPI.getAllAttendance();
            setAllEmployeesAttendance(response.data || []);
        } catch (error) {
            console.error('Error fetching all employees attendance:', error);
        }
    };

    const fetchAllLeaves = async () => {
        try {
            const response = await leaveAPI.getAll();
            setAllLeaves(response.data || []);
        } catch (error) {
            console.error('Error fetching all leaves:', error);
        }
    };

    const handleCheckIn = async () => {
        try {
            setLoading(true);
            await attendanceAPI.checkIn();
            await fetchMyAttendance();
            showNotification('Successfully checked in!', 'success');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to check in';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            setLoading(true);
            await attendanceAPI.checkOut();
            await fetchMyAttendance();
            showNotification('Successfully checked out!', 'success');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to check out';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const getLeaveTypeName = (type) => {
        const types = {
            CASUAL_LEAVE: 'Casual Leave',
            SICK_LEAVE: 'Sick Leave',
            PAID_LEAVE: 'Paid Leave'
        };
        return types[type] || type;
    };

    const calculateLeaveDuration = () => {
        if (leaveForm.startDate && leaveForm.endDate) {
            const start = new Date(leaveForm.startDate);
            const end = new Date(leaveForm.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return diffDays;
        }
        return 0;
    };

    const renderOverview = () => (
        <div className="overview-content">
            <h2>System Overview</h2>
            <div className="stats-grid">
                <motion.div className="stat-card card" whileHover={{ scale: 1.02 }}>
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>{systemStats.totalUsers}</h3>
                        <p>Total Users</p>
                    </div>
                </motion.div>

                <motion.div className="stat-card card" whileHover={{ scale: 1.02 }}>
                    <div className="stat-icon">💼</div>
                    <div className="stat-info">
                        <h3>{systemStats.totalEmployees}</h3>
                        <p>Employees</p>
                    </div>
                </motion.div>

                <motion.div className="stat-card card" whileHover={{ scale: 1.02 }}>
                    <div className="stat-icon">👨‍💼</div>
                    <div className="stat-info">
                        <h3>{systemStats.totalHR}</h3>
                        <p>HR Personnel</p>
                    </div>
                </motion.div>

                <motion.div className="stat-card card" whileHover={{ scale: 1.02 }}>
                    <div className="stat-icon">⚡</div>
                    <div className="stat-info">
                        <h3>{systemStats.activeToday}</h3>
                        <p>Active Today</p>
                    </div>
                </motion.div>
            </div>

            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                    <button className="btn btn-primary" onClick={() => setActiveTab('user-management')}>
                        👥 Manage Users
                    </button>
                    <button className="btn btn-primary" onClick={() => setActiveTab('all-attendance')}>
                        📊 View All Attendance
                    </button>
                    <button className="btn btn-primary" onClick={() => setActiveTab('all-leaves')}>
                        📋 View All Leaves
                    </button>
                </div>
            </div>
        </div>
    );

    const renderMyAttendance = () => (
        <div className="attendance-content">
            <div className="my-attendance-section">
                <div className="attendance-header">
                    <h2>My Attendance</h2>
                    <div className="attendance-status">
                        <span className={`status-badge ${attendanceStatus.toLowerCase()}`}>
                            {attendanceStatus.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                <div className="attendance-actions" style={{ marginBottom: '2rem' }}>
                    {attendanceStatus === 'CHECKED_OUT' && (
                        <button className="btn-primary" onClick={handleCheckIn} disabled={loading}>
                            ⏰ Check In
                        </button>
                    )}
                    {attendanceStatus === 'CHECKED_IN' && (
                        <button className="btn-secondary" onClick={handleCheckOut} disabled={loading}>
                            🏁 Check Out
                        </button>
                    )}
                </div>

                <div className="attendance-history">
                    <h3>My Attendance History</h3>
                    <div className="history-list">
                        {myAttendanceHistory.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                                No attendance records found
                            </p>
                        ) : (
                            myAttendanceHistory.slice(0, 10).map((record) => {
                                const calculateDuration = () => {
                                    if (record.checkInTime && record.checkOutTime) {
                                        const checkIn = new Date(record.checkInTime);
                                        const checkOut = new Date(record.checkOutTime);
                                        const diffMs = checkOut - checkIn;
                                        const hours = Math.floor(diffMs / (1000 * 60 * 60));
                                        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                        return `${hours}h ${minutes}m`;
                                    }
                                    return 'In Progress';
                                };

                                return (
                                    <div key={record.id} className="history-item">
                                        <div className="history-date">
                                            {new Date(record.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        <div className="history-times">
                                            <span>⏰ In: {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                                            <span>🏁 Out: {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                                        </div>
                                        <div className="history-duration">
                                            <div className="duration-value">{calculateDuration()}</div>
                                            <div className="duration-label">Duration</div>
                                        </div>
                                        <div className="history-status">{record.status}</div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMyLeaves = () => (
        <div className="leaves-content">
            <div className="leaves-header">
                <h2>Leave Management</h2>
                <button className="btn-primary" onClick={() => setShowLeaveForm(true)}>
                    Apply for Leave
                </button>
            </div>

            {leaveBalance && (
                <div className="leave-balance-card">
                    <h3>📊 Leave Balance</h3>
                    <div className="balance-grid">
                        <div className="balance-item casual">
                            <div className="balance-icon">🏖️</div>
                            <div className="balance-info">
                                <span className="balance-label">Casual Leave</span>
                                <span className="balance-value">{leaveBalance.remainingCasualLeave || 0} days</span>
                            </div>
                        </div>
                        <div className="balance-item sick">
                            <div className="balance-icon">🤒</div>
                            <div className="balance-info">
                                <span className="balance-label">Sick Leave</span>
                                <span className="balance-value">{leaveBalance.remainingSickLeave || 0} days</span>
                            </div>
                        </div>
                        <div className="balance-item paid">
                            <div className="balance-icon">✈️</div>
                            <div className="balance-info">
                                <span className="balance-label">Paid Leave</span>
                                <span className="balance-value">{leaveBalance.remainingPaidLeave || 0} days</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="leaves-list">
                <h3>My Leave Requests</h3>
                {myLeaves.map((leave) => (
                    <div key={leave.id} className="leave-item">
                        <div className="leave-info">
                            <h4>{getLeaveTypeName(leave.leaveType)}</h4>
                            <p>📅 {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                            <p className="leave-reason">💬 {leave.reason}</p>
                            {leave.hrRemarks && (
                                <p className="hr-remarks" style={{ marginTop: '0.5rem', color: '#e74c3c', fontStyle: 'italic' }}>
                                    <strong>HR Remarks:</strong> {leave.hrRemarks}
                                </p>
                            )}
                        </div>
                        <div className="leave-actions">
                            <span className={`badge badge-${leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'error' : 'warning'}`}>
                                {leave.status}
                            </span>
                            {leave.status === 'PENDING' && (
                                <button
                                    onClick={() => handleRevokeLeave(leave.id)}
                                    style={{
                                        padding: '0.6rem 1.2rem',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(235, 51, 73, 0.3)',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        justifyContent: 'center'
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
                                    <span style={{ fontSize: '1.1rem' }}>🗑️</span>
                                    Cancel Request
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Leave Application Modal */}
            {showLeaveForm && (
                <div className="modal-overlay" onClick={() => setShowLeaveForm(false)}>
                    <motion.div
                        className="modal-content leave-form-modal"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <h2>Apply for Leave</h2>
                        <form onSubmit={handleLeaveSubmit}>
                            <div className="form-group">
                                <label>Leave Type</label>
                                <select
                                    value={leaveForm.leaveType}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                                    required
                                >
                                    <option value="CASUAL_LEAVE">Casual Leave</option>
                                    <option value="SICK_LEAVE">Sick Leave</option>
                                    <option value="PAID_LEAVE">Paid Leave</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={leaveForm.startDate}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={leaveForm.endDate}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                                    min={leaveForm.startDate}
                                    required
                                />
                            </div>
                            {leaveForm.startDate && leaveForm.endDate && (
                                <p className="duration-info">Duration: {calculateLeaveDuration()} day(s)</p>
                            )}
                            <div className="form-group">
                                <label>Reason</label>
                                <textarea
                                    value={leaveForm.reason}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowLeaveForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );

    const renderAttendanceHistory = () => (
        <div className="attendance-history-content">
            <h2>Employee Attendance Records</h2>
            <div className="attendance-table card">
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Date</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allEmployeesAttendance.length > 0 ? (
                            allEmployeesAttendance.map((record) => (
                                <tr key={record.id}>
                                    <td>
                                        <div className="user-info">
                                            <span className="name">{record.employeeName || 'Unknown'}</span>
                                            <span className="email" style={{ fontSize: '0.8rem', color: '#666' }}>{record.employeeEmail}</span>
                                        </div>
                                    </td>
                                    <td>{new Date(record.date).toLocaleDateString()}</td>
                                    <td>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}</td>
                                    <td>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}</td>
                                    <td>
                                        <span className={`status-badge ${record.status?.toLowerCase()}`}>
                                            {record.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="empty-state" style={{ textAlign: 'center', padding: '2rem' }}>No attendance records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderLeaveHistory = () => (
        <div className="leave-history-content">
            <h2>All Leave Records</h2>
            <div className="leave-table card">
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Leave Type</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Reason</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allLeaves.length > 0 ? (
                            allLeaves.map((leave) => (
                                <tr key={leave.id}>
                                    <td>
                                        <div className="user-info">
                                            <span className="name">{leave.userName || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td>{leave.leaveType}</td>
                                    <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                                    <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={leave.reason}>{leave.reason}</td>
                                    <td>
                                        <span className={`badge badge-${leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'error' : 'warning'}`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="empty-state" style={{ textAlign: 'center', padding: '2rem' }}>No leave records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="dashboard-container admin-dashboard">
            <AdminNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                chatUnreadCount={chatUnreadCount}
            />

            <div className="dashboard-main">
                <header className="dashboard-header">
                    <div className="header-left">
                        <h1>Welcome back, {user?.name}</h1>
                        <p className="current-date">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </header>

                <div className="dashboard-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'overview' && renderOverview()}
                            {activeTab === 'chat' && <Chat />}
                            {activeTab === 'meetings' && <Meetings />}

                            {/* Personal Attendance & Leaves */}
                            {activeTab === 'attendance' && renderMyAttendance()}
                            {activeTab === 'leaves' && renderMyLeaves()}

                            {/* All Employees Attendance & Leaves */}
                            {activeTab === 'all-attendance' && renderAttendanceHistory()}
                            {activeTab === 'all-leaves' && renderLeaveHistory()}

                            {/* Performance */}
                            {activeTab === 'apply-review' && <ApplyForReview />}
                            {activeTab === 'my-reviews' && <ViewMyReviews />}

                            {/* Payroll */}
                            {activeTab === 'my-payslips' && <EmployeePayslips />}
                            {activeTab === 'approve-payroll' && <AdminPayrollApproval />}
                            {activeTab === 'salary-structures' && <SalaryStructureManager />}

                            {/* System Management */}
                            {activeTab === 'user-management' && <AdminUserManagement />}
                            {activeTab === 'system-settings' && <SystemSettings />}

                            {/* Analytics & Reports */}
                            {activeTab === 'analytics' && (
                                <div className="analytics-content">
                                    <h2>Analytics Dashboard</h2>
                                    <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                                        Analytics dashboard coming soon...
                                    </p>
                                </div>
                            )}
                            {activeTab === 'reports' && (
                                <div className="reports-content">
                                    <h2>Generate Reports</h2>
                                    <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                                        Reporting module coming soon...
                                    </p>
                                </div>
                            )}
                            {activeTab === 'audit-logs' && (
                                <div className="audit-content">
                                    <h2>Audit Logs</h2>
                                    <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                                        Audit logs interface coming soon...
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Cancel Leave Request"
                message="Are you sure you want to cancel this leave request? This action cannot be undone."
                onConfirm={confirmRevokeLeave}
                onCancel={() => setConfirmDialog({ isOpen: false, leaveId: null })}
            />
        </div>
    );
};

export default AdminDashboard;
