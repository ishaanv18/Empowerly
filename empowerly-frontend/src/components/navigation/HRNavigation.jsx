import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../pages/dashboards/Dashboard.css';

const HRNavigation = ({ activeTab, setActiveTab, chatUnreadCount }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="dashboard-sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-title">Empowerly</h2>
                <p className="sidebar-subtitle">HR</p>
            </div>

            <nav className="sidebar-nav">
                <button
                    className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <span className="nav-icon">🏠</span>
                    <span>Dashboard</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('attendance')}
                >
                    <span className="nav-icon">📅</span>
                    <span>Attendance</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'leaves' ? 'active' : ''}`}
                    onClick={() => setActiveTab('leaves')}
                >
                    <span className="nav-icon">🌴</span>
                    <span>Leaves</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chat')}
                >
                    <span className="nav-icon">💬</span>
                    <span>Chat</span>
                    {chatUnreadCount > 0 && (
                        <span className="badge-count">{chatUnreadCount}</span>
                    )}
                </button>

                <button
                    className={`nav-item ${activeTab === 'meetings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('meetings')}
                >
                    <span className="nav-icon">📹</span>
                    <span>Meetings</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'attendance-history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('attendance-history')}
                >
                    <span className="nav-icon">📊</span>
                    <span>Attendance History</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'leave-history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('leave-history')}
                >
                    <span className="nav-icon">📋</span>
                    <span>Leave History</span>
                </button>

                {/* MY PERFORMANCE Section */}
                <div className="nav-section">
                    <div className="nav-section-title">MY PERFORMANCE</div>
                </div>

                <button
                    className={`nav-item ${activeTab === 'apply-review' ? 'active' : ''}`}
                    onClick={() => setActiveTab('apply-review')}
                >
                    <span className="nav-icon">📝</span>
                    <span>Apply for Review</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'my-reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-reviews')}
                >
                    <span className="nav-icon">📊</span>
                    <span>My Reviews</span>
                </button>

                {/* HR - REVIEWS Section */}
                <div className="nav-section">
                    <div className="nav-section-title">HR - REVIEWS</div>
                </div>

                <button
                    className={`nav-item ${activeTab === 'manage-cycles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manage-cycles')}
                >
                    <span className="nav-icon">🔄</span>
                    <span>Manage Cycles</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'review-dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('review-dashboard')}
                >
                    <span className="nav-icon">👥</span>
                    <span>Review Dashboard</span>
                </button>

                {/* HR - DOCUMENTS Section */}
                <div className="nav-section">
                    <div className="nav-section-title">HR - DOCUMENTS</div>
                </div>

                <button
                    className={`nav-item ${activeTab === 'documents' ? 'active' : ''}`}
                    onClick={() => setActiveTab('documents')}
                >
                    <span className="nav-icon">📄</span>
                    <span>Generate Documents</span>
                </button>

                {/* MY PAYROLL Section */}
                <div className="nav-section">
                    <div className="nav-section-title">MY PAYROLL</div>
                </div>

                <button
                    className={`nav-item ${activeTab === 'my-payslips' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-payslips')}
                >
                    <span className="nav-icon">💰</span>
                    <span>My Payslips</span>
                </button>

                {/* HR - PAYROLL Section */}
                <div className="nav-section">
                    <div className="nav-section-title">HR - PAYROLL</div>
                </div>

                <button
                    className={`nav-item ${activeTab === 'manage-payroll' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manage-payroll')}
                >
                    <span className="nav-icon">💼</span>
                    <span>Manage Payroll</span>
                </button>

                {/* User Management Section */}
                <div className="nav-section">
                    <div className="nav-section-title">USER MANAGEMENT</div>
                </div>

                <button
                    className={`nav-item ${activeTab === 'user-management' ? 'active' : ''}`}
                    onClick={() => setActiveTab('user-management')}
                >
                    <span className="nav-icon">👥</span>
                    <span>User Management</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
                    onClick={() => setActiveTab('feedback')}
                >
                    <span className="nav-icon">💬</span>
                    <span>Feedback</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'skills' ? 'active' : ''}`}
                    onClick={() => {
                        navigate('/dashboard/hr');
                        setActiveTab('skills');
                    }}
                >
                    <span className="nav-icon">🎓</span>
                    <span>Skill Development</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'motivation' ? 'active' : ''}`}
                    onClick={() => {
                        navigate('/dashboard/hr');
                        setActiveTab('motivation');
                    }}
                >
                    <span className="nav-icon">💪</span>
                    <span>Motivation Wall</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => {
                        navigate('/dashboard/hr');
                        setActiveTab('security');
                    }}
                >
                    <span className="nav-icon">🔒</span>
                    <span>Security & Monitoring</span>
                </button>

                <button className="nav-item" onClick={logout}>
                    <span className="nav-icon">🚪</span>
                    <span>Logout</span>
                </button>
            </nav>
        </div>
    );
};

export default HRNavigation;
