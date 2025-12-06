import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI, leaveAPI, chatAPI } from '../../services/api';
import Chat from '../../components/chat/Chat';
import Meetings from '../../components/meetings/Meetings';
import ConfirmDialog from '../../components/ConfirmDialog';

import EmployeePayslips from '../../components/payroll/EmployeePayslips';
import ApplyForReview from '../../components/performance/ApplyForReview';
import ViewMyReviews from '../../components/performance/ViewMyReviews';
import EmployeeFeedback from '../../components/feedback/EmployeeFeedback';
import SkillDevelopment from '../../components/skills/SkillDevelopment';
import MotivationWall from '../../components/motivation/MotivationWall';
import EmployeeNavigation from '../../components/navigation/EmployeeNavigation';
import './Dashboard.css';
import './stat-card-colors.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalAttendance: 0,
        thisMonthAttendance: 0,
        pendingLeaves: 0,
        approvedLeaves: 0,
    });

    // Attendance state
    const [attendanceStatus, setAttendanceStatus] = useState('CHECKED_OUT');
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);

    // Leave state
    const [leaves, setLeaves] = useState([]);
    const [showLeaveForm, setShowLeaveForm] = useState(false);
    const [leaveBalance, setLeaveBalance] = useState(null);
    const [leaveForm, setLeaveForm] = useState({
        leaveType: 'CASUAL_LEAVE',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, leaveId: null });

    // HR state
    const [pendingLeaveRequests, setPendingLeaveRequests] = useState([]);
    const [rejectingLeaveId, setRejectingLeaveId] = useState(null);
    const [rejectRemarks, setRejectRemarks] = useState('');

    // Chat state
    const [chatUnreadCount, setChatUnreadCount] = useState(0);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
        fetchChatUnreadCount();

        // Poll for unread messages every 10 seconds
        const interval = setInterval(fetchChatUnreadCount, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            await Promise.all([
                fetchAttendance(),
                fetchLeaves(),
                fetchLeaveBalance(),
                fetchPendingLeaveRequests()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchAttendance = async () => {
        try {
            const [todayResponse, historyResponse] = await Promise.all([
                attendanceAPI.getTodayAttendance(),
                attendanceAPI.getMyAttendance()
            ]);

            if (todayResponse.data) {
                setTodayAttendance(todayResponse.data);
                setAttendanceStatus(todayResponse.data.status);
            }

            setAttendanceHistory(historyResponse.data);

            // Calculate stats
            const thisMonth = new Date().getMonth();
            const thisMonthRecords = historyResponse.data.filter(record => {
                const recordMonth = new Date(record.date).getMonth();
                return recordMonth === thisMonth;
            });

            setStats(prev => ({
                ...prev,
                totalAttendance: historyResponse.data.length,
                thisMonthAttendance: thisMonthRecords.length
            }));
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    const fetchLeaves = async () => {
        try {
            const response = await leaveAPI.getMyLeaves();
            setLeaves(response.data);

            const pending = response.data.filter(leave => leave.status === 'PENDING').length;
            const approved = response.data.filter(leave => leave.status === 'APPROVED').length;

            setStats(prev => ({
                ...prev,
                pendingLeaves: pending,
                approvedLeaves: approved
            }));
        } catch (error) {
            console.error('Error fetching leaves:', error);
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

    const fetchPendingLeaveRequests = async () => {
        if (user?.role === 'HR' || user?.role === 'ADMIN') {
            try {
                const response = await leaveAPI.getPendingLeaves();
                setPendingLeaveRequests(response.data);
            } catch (error) {
                console.error('Error fetching pending leave requests:', error);
            }
        }
    };

    const fetchChatUnreadCount = async () => {
        try {
            const response = await chatAPI.getUnreadCount();
            setChatUnreadCount(response.data);
        } catch (error) {
            // Silently fail - chat service might not be available
        }
    };

    const handleCheckIn = async () => {
        try {
            setLoading(true);
            await attendanceAPI.checkIn();
            await fetchAttendance();
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
            await fetchAttendance();
            showNotification('Successfully checked out!', 'success');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to check out';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await leaveAPI.apply(leaveForm);
            setShowLeaveForm(false);
            setLeaveForm({ leaveType: 'CASUAL_LEAVE', startDate: '', endDate: '', reason: '' });
            await fetchLeaves();
            await fetchLeaveBalance();
            showNotification('Leave request submitted successfully!', 'success');
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
            await fetchLeaves();
            showNotification('Leave request cancelled successfully!', 'success');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to cancel leave request';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveLeave = async (leaveId) => {
        try {
            await leaveAPI.approveLeave(leaveId);
            await fetchPendingLeaveRequests();
        } catch (error) {
            alert('Failed to approve leave');
        }
    };

    const handleRejectLeave = async (leaveId) => {
        try {
            await leaveAPI.rejectLeave(leaveId, rejectRemarks);
            setRejectingLeaveId(null);
            setRejectRemarks('');
            await fetchPendingLeaveRequests();
        } catch (error) {
            alert('Failed to reject leave');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: { class: 'badge-warning', text: 'Pending' },
            APPROVED: { class: 'badge-success', text: 'Approved' },
            REJECTED: { class: 'badge-error', text: 'Rejected' }
        };
        const badge = badges[status] || badges.PENDING;
        return <span className={`badge ${badge.class}`}>{badge.text}</span>;
    };

    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getCurrentDate = () => {
        const now = new Date();
        return now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const calculateDuration = () => {
        if (leaveForm.startDate && leaveForm.endDate) {
            const start = new Date(leaveForm.startDate);
            const end = new Date(leaveForm.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return diffDays;
        }
        return 0;
    };

    const getLeaveTypeName = (type) => {
        const types = {
            CASUAL_LEAVE: 'Casual Leave',
            SICK_LEAVE: 'Sick Leave',
            PAID_LEAVE: 'Paid Leave'
        };
        return types[type] || type;
    };

    const renderOverview = () => (
        <div className="overview-content">
            <h2 className="section-title">Employee Dashboard Overview</h2>
            <div className="stats-grid">
                <motion.div className="stat-card card" whileHover={{ scale: 1.02 }}>
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <h3>{stats.totalAttendance}</h3>
                        <p>Total Attendance</p>
                    </div>
                </motion.div>

                <motion.div className="stat-card card" whileHover={{ scale: 1.02 }}>
                    <div className="stat-icon">🏖️</div>
                    <div className="stat-info">
                        <h3>{leaves.length}</h3>
                        <p>Total Leaves</p>
                    </div>
                </motion.div>

                <motion.div className="stat-card card" whileHover={{ scale: 1.02 }}>
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                        <h3>{stats.pendingLeaves}</h3>
                        <p>Pending Leaves</p>
                    </div>
                </motion.div>

                <motion.div className="stat-card card" whileHover={{ scale: 1.02 }}>
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <h3>{stats.approvedLeaves}</h3>
                        <p>Approved Leaves</p>
                    </div>
                </motion.div>
            </div>

            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                    <button className="action-btn primary" onClick={() => setActiveTab('attendance')}>
                        ⏰ Check Out
                    </button>
                    <button className="action-btn secondary" onClick={() => setShowLeaveForm(true)}>
                        📝 Apply for Leave
                    </button>
                </div>
            </div>
        </div>
    );

    const renderAttendance = () => (
        <div className="attendance-content">
            <div className="attendance-header">
                <h2>Attendance Management</h2>
                <div className="attendance-status">
                    <span className={`status-badge ${attendanceStatus.toLowerCase()}`}>
                        {attendanceStatus.replace('_', ' ')}
                    </span>
                </div>
            </div>

            <div className="attendance-actions">
                {attendanceStatus === 'CHECKED_OUT' && (
                    <button className="btn-primary" onClick={handleCheckIn} disabled={loading}>
                        Check In
                    </button>
                )}
                {attendanceStatus === 'CHECKED_IN' && (
                    <button className="btn-secondary" onClick={handleCheckOut} disabled={loading}>
                        Check Out
                    </button>
                )}
            </div>

            <div className="attendance-history">
                <h3>Attendance History</h3>
                <div className="history-list">
                    {attendanceHistory.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                            No attendance records found
                        </p>
                    ) : (
                        attendanceHistory.map((record) => {
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
    );

    const renderLeaves = () => (
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
                {leaves.map((leave) => (
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
                        <div className="leave-status">
                            {getStatusBadge(leave.status)}
                            {leave.status === 'PENDING' && (
                                <button
                                    onClick={() => handleRevokeLeave(leave.id)}
                                    disabled={loading}
                                    style={{
                                        marginTop: '0.75rem',
                                        padding: '0.6rem 1.2rem',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.6 : 1,
                                        boxShadow: '0 4px 12px rgba(235, 51, 73, 0.3)',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        justifyContent: 'center'
                                    }}
                                    onMouseOver={(e) => {
                                        if (!loading) {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(235, 51, 73, 0.4)';
                                        }
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
        </div>
    );

    const renderHRPanel = () => (
        <div className="hr-panel-content">
            <h2>Pending Leave Requests</h2>
            <div className="leave-requests-list">
                {pendingLeaveRequests.map((leave) => (
                    <div key={leave.id} className="leave-request-item">
                        <div className="request-info">
                            <h4>{leave.employeeName}</h4>
                            <p>{getLeaveTypeName(leave.leaveType)}</p>
                            <p>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                            <p className="leave-reason">{leave.reason}</p>
                        </div>
                        <div className="request-actions">
                            <button className="btn-success" onClick={() => handleApproveLeave(leave.id)}>
                                Approve
                            </button>
                            <button className="btn-error" onClick={() => setRejectingLeaveId(leave.id)}>
                                Reject
                            </button>
                        </div>
                        {rejectingLeaveId === leave.id && (
                            <div className="reject-form">
                                <textarea
                                    placeholder="Rejection remarks..."
                                    value={rejectRemarks}
                                    onChange={(e) => setRejectRemarks(e.target.value)}
                                />
                                <div className="reject-actions">
                                    <button className="btn-secondary" onClick={() => setRejectingLeaveId(null)}>
                                        Cancel
                                    </button>
                                    <button className="btn-error" onClick={() => handleRejectLeave(leave.id)}>
                                        Confirm Reject
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="dashboard-layout">
            {/* Employee Sidebar Navigation */}
            <EmployeeNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                chatUnreadCount={chatUnreadCount}
            />

            {/* Main Content */}
            <div className="dashboard-main">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">
                            Welcome back, <span className="gradient-text">{user?.name}</span>!
                        </h1>
                        <p className="dashboard-subtitle">{user?.department} • {getCurrentDate()}</p>
                    </div>
                    <div className="current-time">
                        <span className="time-icon">🕐</span>
                        <span className="time-text">{getCurrentTime()}</span>
                    </div>
                </div>

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
                            {activeTab === 'attendance' && renderAttendance()}
                            {activeTab === 'leaves' && renderLeaves()}
                            {activeTab === 'chat' && <Chat />}
                            {activeTab === 'meetings' && <Meetings />}
                            {activeTab === 'apply-review' && <ApplyForReview />}
                            {activeTab === 'my-reviews' && <ViewMyReviews />}
                            {activeTab === 'feedback' && <EmployeeFeedback />}
                            {activeTab === 'skills' && <SkillDevelopment />}
                            {activeTab === 'motivation' && <MotivationWall />}
                            {activeTab === 'payslips' && <EmployeePayslips />}
                            {activeTab === 'hr-panel' && renderHRPanel()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Leave Form Modal - Available globally */}
            {showLeaveForm && (
                <div className="modal-overlay" onClick={() => setShowLeaveForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Apply for Leave</h3>
                        <form onSubmit={handleLeaveSubmit}>
                            <div className="form-group">
                                <label>Leave Type</label>
                                <select
                                    value={leaveForm.leaveType}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
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
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Reason</label>
                                <textarea
                                    value={leaveForm.reason}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowLeaveForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

export default Dashboard;
