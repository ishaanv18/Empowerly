import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI, leaveAPI, chatAPI, userAPI } from '../../services/api';
import Chat from '../../components/chat/Chat';
import Meetings from '../../components/meetings/Meetings';
import HRNavigation from '../../components/navigation/HRNavigation';
import ReviewCycleManager from '../../components/performance/ReviewCycleManager';
import HRReviewDashboard from '../../components/performance/HRReviewDashboard';
import ApplyForReview from '../../components/performance/ApplyForReview';
import ViewMyReviews from '../../components/performance/ViewMyReviews';
import HRPayrollDashboard from '../../components/payroll/HRPayrollDashboard';
import EmployeePayslips from '../../components/payroll/EmployeePayslips';
import HRUserManagement from '../../components/users/HRUserManagement';
import DocumentGeneration from '../../components/documents/DocumentGeneration';
import HRFeedbackManagement from '../../components/feedback/HRFeedbackManagement';
import SkillDevelopment from '../../components/skills/SkillDevelopment';
import MotivationWall from '../../components/motivation/MotivationWall';
import SecurityDashboard from '../../components/security/SecurityDashboard';
import * as XLSX from 'xlsx';
import '../dashboards/Dashboard.css';

const HRDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('overview');
    const [chatUnreadCount, setChatUnreadCount] = useState(0);

    // HR-specific state
    const [allEmployeesAttendance, setAllEmployeesAttendance] = useState([]);
    const [allLeaves, setAllLeaves] = useState([]);
    const [pendingLeaveRequests, setPendingLeaveRequests] = useState([]);
    const [companyStats, setCompanyStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        pendingLeaves: 0,
        approvedLeaves: 0
    });

    // HR's own attendance state
    const [attendanceStatus, setAttendanceStatus] = useState('CHECKED_OUT');
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [myAttendanceHistory, setMyAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // Rejection modal state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingLeaveId, setRejectingLeaveId] = useState(null);
    const [rejectRemarks, setRejectRemarks] = useState('');

    // Sorting state for history sections
    const [attendanceSortBy, setAttendanceSortBy] = useState('date-desc');
    const [leaveSortBy, setLeaveSortBy] = useState('date-desc');

    // Search and filter state
    const [attendanceSearchName, setAttendanceSearchName] = useState('');
    const [attendanceSearchDept, setAttendanceSearchDept] = useState('');
    const [attendanceSearchDate, setAttendanceSearchDate] = useState('');
    const [leaveSearchName, setLeaveSearchName] = useState('');
    const [leaveSearchDept, setLeaveSearchDept] = useState('');
    const [leaveSearchDate, setLeaveSearchDate] = useState('');

    useEffect(() => {
        if (user?.role === 'HR' || user?.role === 'ADMIN') {
            fetchHRData();
            fetchMyAttendance();
            fetchChatUnreadCount();
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'attendance-history') {
            fetchAllEmployeesAttendance();
        } else if (activeTab === 'leave-history') {
            fetchAllLeaves();
        }
    }, [activeTab]);

    const fetchHRData = async () => {
        try {
            // Fetch all users to get total employees
            const usersRes = await userAPI.getAllUsers();
            const totalEmployees = usersRes.data?.length || 0;

            // Fetch all attendance records for today
            const attendanceRes = await attendanceAPI.getAllAttendance();
            const today = new Date().toISOString().split('T')[0];
            const presentToday = attendanceRes.data?.filter(record => {
                const recordDate = new Date(record.date).toISOString().split('T')[0];
                return recordDate === today && record.checkInTime != null;
            }).length || 0;

            // Fetch pending leave requests for HR
            const pendingLeavesRes = await leaveAPI.getPending();
            setPendingLeaveRequests(pendingLeavesRes.data || []);
            const pendingLeaves = pendingLeavesRes.data?.length || 0;

            // Fetch all leaves and calculate approved this month
            const allLeavesRes = await leaveAPI.getAll();
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const approvedThisMonth = allLeavesRes.data?.filter(leave => {
                if (leave.status !== 'APPROVED') return false;
                const approvedDate = new Date(leave.approvedAt || leave.createdAt);
                return approvedDate.getMonth() === currentMonth &&
                    approvedDate.getFullYear() === currentYear;
            }).length || 0;

            // Update all stats
            setCompanyStats({
                totalEmployees,
                presentToday,
                pendingLeaves,
                approvedLeaves: approvedThisMonth
            });
        } catch (error) {
            console.error('Error fetching HR data:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
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

    const handleApproveLeave = async (leaveId) => {
        try {
            await leaveAPI.approve(leaveId, 'Approved by HR');
            fetchHRData();
            showNotification('Leave approved successfully!', 'success');
        } catch (error) {
            console.error('Error approving leave:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to approve leave';
            showNotification(errorMessage, 'error');
        }
    };

    const handleRejectLeave = (leaveId) => {
        setRejectingLeaveId(leaveId);
        setShowRejectModal(true);
    };

    const confirmRejectLeave = async () => {
        if (!rejectRemarks.trim()) {
            showNotification('Please provide a reason for rejection', 'warning');
            return;
        }

        try {
            await leaveAPI.reject(rejectingLeaveId, rejectRemarks);
            setShowRejectModal(false);
            setRejectingLeaveId(null);
            setRejectRemarks('');
            fetchHRData();
            showNotification('Leave rejected successfully!', 'success');
        } catch (error) {
            console.error('Error rejecting leave:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to reject leave';
            showNotification(errorMessage, 'error');
        }
    };

    const cancelReject = () => {
        setShowRejectModal(false);
        setRejectingLeaveId(null);
        setRejectRemarks('');
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

    const renderOverview = () => (
        <div className="overview-content">
            <h2>HR Dashboard Overview</h2>
            <div className="stats-grid">
                <motion.div className="stat-card card" whileHover={{ scale: 1.02 }}>
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>{companyStats.totalEmployees}</h3>
                        <p>Total Employees</p>
                    </div>
                </motion.div>

                <motion.div className="stat-card card" whileHover={{ scale: 1.02 }}>
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <h3>{companyStats.presentToday}</h3>
                        <p>Present Today</p>
                    </div>
                </motion.div>

                <motion.div className="stat-card card" whileHover={{ scale: 1.02 }}>
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                        <h3>{companyStats.pendingLeaves}</h3>
                        <p>Pending Leave Requests</p>
                    </div>
                </motion.div>

                <motion.div className="stat-card card" whileHover={{ scale: 1.02 }}>
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <h3>{companyStats.approvedLeaves}</h3>
                        <p>Approved This Month</p>
                    </div>
                </motion.div>
            </div>

            <div className="quick-actions card">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                    <button className="btn btn-primary" onClick={() => setActiveTab('leaves')}>
                        Approve Leaves
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/hr/payroll')}>
                        Manage Payroll
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/hr/cycles')}>
                        Review Cycles
                    </button>
                </div>
            </div>
        </div>
    );

    const renderAttendance = () => (
        <div className="attendance-content">
            {/* HR's Own Attendance Section */}
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

                {/* HR's Attendance History */}
                <div className="attendance-history">
                    <h3>My Attendance History</h3>
                    <div className="history-list">
                        {myAttendanceHistory.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                                No attendance records found
                            </p>
                        ) : (
                            myAttendanceHistory.slice(0, 5).map((record) => {
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

    // ==================== SORTING AND EXPORT FUNCTIONS ====================

    // Sort attendance data
    const sortAttendanceData = (data) => {
        const sorted = [...data];
        switch (attendanceSortBy) {
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'name':
                return sorted.sort((a, b) => (a.userName || '').localeCompare(b.userName || ''));
            case 'status':
                return sorted.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
            default:
                return sorted;
        }
    };

    // Sort leave data
    const sortLeaveData = (data) => {
        const sorted = [...data];
        switch (leaveSortBy) {
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
            case 'name':
                return sorted.sort((a, b) => (a.userName || '').localeCompare(b.userName || ''));
            case 'type':
                return sorted.sort((a, b) => (a.leaveType || '').localeCompare(b.leaveType || ''));
            case 'status':
                return sorted.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
            default:
                return sorted;
        }
    };

    // Filter attendance data
    const filterAttendanceData = (data) => {
        return data.filter(record => {
            const nameMatch = !attendanceSearchName ||
                (record.userName || '').toLowerCase().includes(attendanceSearchName.toLowerCase());
            const deptMatch = !attendanceSearchDept ||
                (record.department || '').toLowerCase().includes(attendanceSearchDept.toLowerCase());
            const dateMatch = !attendanceSearchDate ||
                (record.date && new Date(record.date).toISOString().split('T')[0] === attendanceSearchDate);
            return nameMatch && deptMatch && dateMatch;
        });
    };

    // Filter leave data
    const filterLeaveData = (data) => {
        return data.filter(leave => {
            const nameMatch = !leaveSearchName ||
                (leave.userName || '').toLowerCase().includes(leaveSearchName.toLowerCase());
            const deptMatch = !leaveSearchDept ||
                (leave.department || '').toLowerCase().includes(leaveSearchDept.toLowerCase());
            const dateMatch = !leaveSearchDate ||
                (leave.startDate && new Date(leave.startDate).toISOString().split('T')[0] === leaveSearchDate);
            return nameMatch && deptMatch && dateMatch;
        });
    };

    // Export attendance to Excel
    const exportAttendanceToExcel = () => {
        try {
            // Check if there's data to export
            if (!allEmployeesAttendance || allEmployeesAttendance.length === 0) {
                showNotification('No attendance data to export', 'warning');
                return;
            }

            const sortedData = sortAttendanceData(allEmployeesAttendance);
            const exportData = sortedData.map(record => ({
                'Employee Name': record.userName || 'N/A',
                'Department': record.department || 'N/A',
                'Date': record.date ? new Date(record.date).toLocaleDateString() : '-',
                'Status': record.status || '-',
                'Check-in Time': record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-',
                'Check-out Time': record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-',
                'Duration (Hours)': record.totalWorkHours || '-',
                'Remarks': record.remarks || '-'
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Attendance History");
            XLSX.writeFile(wb, `Attendance_History_${new Date().toISOString().split('T')[0]}.xlsx`);
            showNotification(`Successfully exported ${exportData.length} attendance records!`, 'success');
        } catch (error) {
            console.error('Error exporting attendance:', error);
            showNotification('Failed to export attendance data. Please try again.', 'error');
        }
    };

    // Export leave to Excel
    const exportLeaveToExcel = () => {
        try {
            // Check if there's data to export
            if (!allLeaves || allLeaves.length === 0) {
                showNotification('No leave data to export', 'warning');
                return;
            }

            const sortedData = sortLeaveData(allLeaves);
            const exportData = sortedData.map(leave => {
                const calculateDays = () => {
                    if (leave.startDate && leave.endDate) {
                        const start = new Date(leave.startDate);
                        const end = new Date(leave.endDate);
                        const diffTime = Math.abs(end - start);
                        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    }
                    return '-';
                };

                return {
                    'Employee': leave.userName || 'N/A',
                    'Department': leave.department || 'N/A',
                    'Leave Type': leave.leaveType || 'N/A',
                    'Start Date': leave.startDate ? new Date(leave.startDate).toLocaleDateString() : '-',
                    'End Date': leave.endDate ? new Date(leave.endDate).toLocaleDateString() : '-',
                    'Days': calculateDays(),
                    'Status': leave.status || '-',
                    'Reason': leave.reason || '-',
                    'HR Remarks': leave.hrRemarks || '-'
                };
            });

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Leave History");
            XLSX.writeFile(wb, `Leave_History_${new Date().toISOString().split('T')[0]}.xlsx`);
            showNotification(`Successfully exported ${exportData.length} leave records!`, 'success');
        } catch (error) {
            console.error('Error exporting leave data:', error);
            showNotification('Failed to export leave data. Please try again.', 'error');
        }
    };

    const renderAttendanceHistory = () => {
        const filteredData = filterAttendanceData(allEmployeesAttendance);
        const sortedData = sortAttendanceData(filteredData);

        return (
            <div className="attendance-history-content">
                <h2>All Employees Attendance History</h2>

                {/* Toolbar with Search, Sort and Export */}
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}>
                    {/* Search Inputs Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1rem',
                        marginBottom: '1rem'
                    }}>
                        <input
                            type="text"
                            placeholder="🔍 Search by name..."
                            value={attendanceSearchName}
                            onChange={(e) => setAttendanceSearchName(e.target.value)}
                            style={{
                                padding: '0.6rem 1rem',
                                fontSize: '0.9rem',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.9)',
                                outline: 'none'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="🏢 Search by department..."
                            value={attendanceSearchDept}
                            onChange={(e) => setAttendanceSearchDept(e.target.value)}
                            style={{
                                padding: '0.6rem 1rem',
                                fontSize: '0.9rem',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.9)',
                                outline: 'none'
                            }}
                        />
                        <input
                            type="date"
                            value={attendanceSearchDate}
                            onChange={(e) => setAttendanceSearchDate(e.target.value)}
                            style={{
                                padding: '0.6rem 1rem',
                                fontSize: '0.9rem',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.9)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Sort and Export Row */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <select
                            value={attendanceSortBy}
                            onChange={(e) => setAttendanceSortBy(e.target.value)}
                            style={{
                                padding: '0.6rem 1.2rem',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.9)',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="date-desc">📅 Latest First</option>
                            <option value="date-asc">📅 Oldest First</option>
                            <option value="name">👤 Name (A-Z)</option>
                            <option value="status">📊 Status</option>
                        </select>

                        <button
                            onClick={exportAttendanceToExcel}
                            style={{
                                padding: '0.6rem 1.5rem',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                background: 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(56, 239, 125, 0.3)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(56, 239, 125, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(56, 239, 125, 0.3)';
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>📥</span>
                            Export to Excel
                        </button>
                    </div>
                </div>

                <div className="attendance-table card">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee Name</th>
                                <th>Department</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Check-in Time</th>
                                <th>Check-out Time</th>
                                <th>Duration</th>
                                <th>Remarks</th>
                            </tr>
                        </thead >
                        <tbody>
                            {sortedData.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                        No attendance records found
                                    </td>
                                </tr>
                            ) : (
                                sortedData.map((record, index) => {
                                    const calculateDuration = () => {
                                        if (record.checkInTime && record.checkOutTime) {
                                            const checkIn = new Date(record.checkInTime);
                                            const checkOut = new Date(record.checkOutTime);
                                            const diffMs = checkOut - checkIn;
                                            const hours = Math.floor(diffMs / (1000 * 60 * 60));
                                            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                            return `${hours}h ${minutes}m`;
                                        }
                                        return '-';
                                    };

                                    return (
                                        <tr key={index}>
                                            <td>{record.userName || 'N/A'}</td>
                                            <td>{record.department || 'N/A'}</td>
                                            <td>{record.date ? new Date(record.date).toLocaleDateString() : '-'}</td>
                                            <td>
                                                <span className={`badge ${record.status === 'CHECKED_IN' ? 'badge-success' : 'badge-error'}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td>{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}</td>
                                            <td>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}</td>
                                            <td>{calculateDuration()}</td>
                                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {record.remarks || '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table >
                </div >
            </div >
        );
    };

    const renderLeaveHistory = () => {
        const filteredData = filterLeaveData(allLeaves);
        const sortedData = sortLeaveData(filteredData);

        return (
            <div className="leave-history-content">
                <h2>All Employees Leave History</h2>

                {/* Toolbar with Search, Sort and Export */}
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)'
                }}>
                    {/* Search Inputs Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1rem',
                        marginBottom: '1rem'
                    }}>
                        <input
                            type="text"
                            placeholder="🔍 Search by name..."
                            value={leaveSearchName}
                            onChange={(e) => setLeaveSearchName(e.target.value)}
                            style={{
                                padding: '0.6rem 1rem',
                                fontSize: '0.9rem',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.9)',
                                outline: 'none'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="🏢 Search by department..."
                            value={leaveSearchDept}
                            onChange={(e) => setLeaveSearchDept(e.target.value)}
                            style={{
                                padding: '0.6rem 1rem',
                                fontSize: '0.9rem',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.9)',
                                outline: 'none'
                            }}
                        />
                        <input
                            type="date"
                            value={leaveSearchDate}
                            onChange={(e) => setLeaveSearchDate(e.target.value)}
                            style={{
                                padding: '0.6rem 1rem',
                                fontSize: '0.9rem',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.9)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Sort and Export Row */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <select
                            value={leaveSortBy}
                            onChange={(e) => setLeaveSortBy(e.target.value)}
                            style={{
                                padding: '0.6rem 1.2rem',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.9)',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="date-desc">📅 Latest First</option>
                            <option value="date-asc">📅 Oldest First</option>
                            <option value="name">👤 Name (A-Z)</option>
                            <option value="type">📋 Leave Type</option>
                            <option value="status">📊 Status</option>
                        </select>

                        <button
                            onClick={exportLeaveToExcel}
                            style={{
                                padding: '0.6rem 1.5rem',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                background: 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(56, 239, 125, 0.3)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(56, 239, 125, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(56, 239, 125, 0.3)';
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>📥</span>
                            Export to Excel
                        </button>
                    </div>
                </div>

                <div className="leave-table card">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Leave Type</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Days</th>
                                <th>Status</th>
                                <th>Reason</th>
                                <th>Remarks</th>
                            </tr>
                        </thead >
                        <tbody>
                            {sortedData.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                        No leave records found
                                    </td>
                                </tr>
                            ) : (
                                sortedData.map((leave) => {
                                    const calculateDays = () => {
                                        if (leave.startDate && leave.endDate) {
                                            const start = new Date(leave.startDate);
                                            const end = new Date(leave.endDate);
                                            const diffTime = Math.abs(end - start);
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                            return diffDays;
                                        }
                                        return '-';
                                    };

                                    const getStatusBadgeClass = (status) => {
                                        switch (status) {
                                            case 'APPROVED':
                                                return 'badge-success';
                                            case 'REJECTED':
                                                return 'badge-error';
                                            case 'PENDING':
                                                return 'badge-warning';
                                            default:
                                                return '';
                                        }
                                    };

                                    return (
                                        <tr key={leave.id}>
                                            <td>{leave.userName || 'N/A'}</td>
                                            <td>{leave.department || 'N/A'}</td>
                                            <td>{leave.leaveType || 'N/A'}</td>
                                            <td>{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : '-'}</td>
                                            <td>{leave.endDate ? new Date(leave.endDate).toLocaleDateString() : '-'}</td>
                                            <td>{calculateDays()}</td>
                                            <td>
                                                <span className={`badge ${getStatusBadgeClass(leave.status)}`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {leave.reason || '-'}
                                            </td>
                                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {leave.hrRemarks || '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table >
                </div >
            </div >
        );
    };

    const renderLeaves = () => (
        <div className="leaves-content">
            <div className="leaves-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem' }}>Leave Approval Queue</h2>
                <p style={{ color: '#666', fontSize: '1rem' }}>Review and manage employee leave requests</p>
            </div>
            <div className="leave-requests" style={{
                maxWidth: '900px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}>
                {pendingLeaveRequests.length > 0 ? (
                    pendingLeaveRequests.map((leave) => (
                        <motion.div
                            key={leave.id}
                            className="leave-request-card card"
                            whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '16px',
                                padding: '0',
                                overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{
                                background: 'white',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                margin: '3px'
                            }}>
                                <div className="leave-header" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1.5rem',
                                    paddingBottom: '1rem',
                                    borderBottom: '2px solid #f0f0f0'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {leave.userName?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: '0', fontSize: '1.25rem', fontWeight: '600' }}>{leave.userName}</h3>
                                            <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>{leave.department || 'Employee'}</p>
                                        </div>
                                    </div>
                                    <span className="badge" style={{
                                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                        color: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 10px rgba(245, 87, 108, 0.3)'
                                    }}>
                                        ⏳ Pending
                                    </span>
                                </div>
                                <div className="leave-details" style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '1rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{
                                        background: '#f8f9ff',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '2px solid #e8ebff'
                                    }}>
                                        <p style={{ margin: '0', color: '#666', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Leave Type</p>
                                        <p style={{ margin: '0', fontWeight: '600', fontSize: '1rem', color: '#333' }}>
                                            {leave.leaveType === 'CASUAL_LEAVE' ? '🏖️ Casual Leave' :
                                                leave.leaveType === 'SICK_LEAVE' ? '🤒 Sick Leave' :
                                                    '✈️ Paid Leave'}
                                        </p>
                                    </div>
                                    <div style={{
                                        background: '#f8f9ff',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '2px solid #e8ebff'
                                    }}>
                                        <p style={{ margin: '0', color: '#666', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Duration</p>
                                        <p style={{ margin: '0', fontWeight: '600', fontSize: '1rem', color: '#333' }}>
                                            📅 {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div style={{
                                        gridColumn: '1 / -1',
                                        background: '#fffbf0',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '2px solid #fff4d6'
                                    }}>
                                        <p style={{ margin: '0', color: '#666', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Reason</p>
                                        <p style={{ margin: '0', fontWeight: '500', fontSize: '0.95rem', color: '#333', lineHeight: '1.5' }}>
                                            {leave.reason}
                                        </p>
                                    </div>
                                </div>
                                <div className="leave-actions" style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    justifyContent: 'center'
                                }}>
                                    <button
                                        onClick={() => handleApproveLeave(leave.id)}
                                        style={{
                                            flex: '1',
                                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '1rem 2rem',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 15px rgba(56, 239, 125, 0.3)',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(56, 239, 125, 0.4)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(56, 239, 125, 0.3)';
                                        }}
                                    >
                                        ✓ Approve
                                    </button>
                                    <button
                                        onClick={() => handleRejectLeave(leave.id)}
                                        style={{
                                            flex: '1',
                                            background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '1rem 2rem',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 15px rgba(235, 51, 73, 0.3)',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(235, 51, 73, 0.4)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(235, 51, 73, 0.3)';
                                        }}
                                    >
                                        ✗ Reject
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '16px',
                        color: 'white'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Pending Requests</h3>
                        <p style={{ opacity: '0.9' }}>All leave requests have been processed</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="dashboard-container">
            {/* HR Sidebar Navigation */}
            <HRNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                chatUnreadCount={chatUnreadCount}
            />

            {/* Main Content */}
            <div className="dashboard-main">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">Welcome back, {user?.name}!</h1>
                        <p className="dashboard-subtitle">{user?.role} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>

                <div className="dashboard-content">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'attendance' && renderAttendance()}
                        {activeTab === 'attendance-history' && renderAttendanceHistory()}
                        {activeTab === 'leave-history' && renderLeaveHistory()}
                        {activeTab === 'leaves' && renderLeaves()}
                        {activeTab === 'apply-review' && <ApplyForReview />}
                        {activeTab === 'my-reviews' && <ViewMyReviews />}
                        {activeTab === 'manage-cycles' && <ReviewCycleManager />}
                        {activeTab === 'review-dashboard' && <HRReviewDashboard />}
                        {activeTab === 'manage-payroll' && <HRPayrollDashboard />}
                        {activeTab === 'my-payslips' && <EmployeePayslips />}
                        {activeTab === 'user-management' && <HRUserManagement />}
                        {activeTab === 'documents' && <DocumentGeneration />}
                        {activeTab === 'feedback' && <HRFeedbackManagement />}
                        {activeTab === 'skills' && <SkillDevelopment />}
                        {activeTab === 'motivation' && <MotivationWall />}
                        {activeTab === 'security' && <SecurityDashboard />}
                        {activeTab === 'chat' && <Chat />}
                        {activeTab === 'meetings' && <Meetings />}
                    </AnimatePresence>
                </div>
            </div>

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="modal-overlay" onClick={cancelReject} style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <motion.div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            maxWidth: '500px',
                            width: '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }}
                    >
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem' }}>Reject Leave Request</h3>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                Reason for Rejection <span style={{ color: 'red' }}>*</span>
                            </label>
                            <textarea
                                value={rejectRemarks}
                                onChange={(e) => setRejectRemarks(e.target.value)}
                                placeholder="Please provide a detailed reason for rejecting this leave request..."
                                required
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '2px solid #e0e0e0',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                        <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={cancelReject}
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
                                onClick={confirmRejectLeave}
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
                                Confirm Rejection
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default HRDashboard;
