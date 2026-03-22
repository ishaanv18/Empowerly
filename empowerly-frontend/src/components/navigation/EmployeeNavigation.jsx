import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../pages/dashboards/Dashboard.css';

const EmployeeNavigation = ({ activeTab, setActiveTab, chatUnreadCount }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="dashboard-sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-title">Empowerly</h2>
                <p className="sidebar-subtitle">EMPLOYEE</p>
            </div>

            <nav className="sidebar-nav">
                <button
                    className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => {
                        navigate('/dashboard/employee');
                        setActiveTab('overview');
                    }}
                >
                    <span className="nav-icon">🏠</span>
                    <span>Dashboard</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
                    onClick={() => {
                        navigate('/dashboard/employee');
                        setActiveTab('attendance');
                    }}
                >
                    <span className="nav-icon">📅</span>
                    <span>Attendance</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'leaves' ? 'active' : ''}`}
                    onClick={() => {
                        navigate('/dashboard/employee');
                        setActiveTab('leaves');
                    }}
                >
                    <span className="nav-icon">🌴</span>
                    <span>Leaves</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => {
                        navigate('/dashboard/employee');
                        setActiveTab('chat');
                    }}
                >
                    <span className="nav-icon">💬</span>
                    <span>Chat</span>
                    {chatUnreadCount > 0 && (
                        <span className="badge-count">{chatUnreadCount}</span>
                    )}
                </button>

                <button
                    className={`nav-item ${activeTab === 'meetings' ? 'active' : ''}`}
                    onClick={() => {
                        navigate('/dashboard/employee');
                        setActiveTab('meetings');
                    }}
                >
                    <span className="nav-icon">📹</span>
                    <span>Meetings</span>
                </button>

                {/* Performance Section */}
                <div className="nav-section">
                    <div className="nav-section-title">PERFORMANCE</div>
                    <button
                        className={`nav-item ${activeTab === 'apply-review' ? 'active' : ''}`}
                        onClick={() => {
                            navigate('/dashboard/employee');
                            setActiveTab('apply-review');
                        }}
                    >
                        <span className="nav-icon">📝</span>
                        <span>Apply for Review</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'my-reviews' ? 'active' : ''}`}
                        onClick={() => {
                            navigate('/dashboard/employee');
                            setActiveTab('my-reviews');
                        }}
                    >
                        <span className="nav-icon">📊</span>
                        <span>My Reviews</span>
                    </button>
                </div>

                <button
                    className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
                    onClick={() => {
                        navigate('/dashboard/employee');
                        setActiveTab('feedback');
                    }}
                >
                    <span className="nav-icon">💬</span>
                    <span>Feedback</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'skills' ? 'active' : ''}`}
                    onClick={() => {
                        navigate('/dashboard/employee');
                        setActiveTab('skills');
                    }}
                >
                    <span className="nav-icon">🎓</span>
                    <span>Skill Development</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'motivation' ? 'active' : ''}`}
                    onClick={() => {
                        navigate('/dashboard/employee');
                        setActiveTab('motivation');
                    }}
                >
                    <span className="nav-icon">💪</span>
                    <span>Motivation Wall</span>
                </button>

                {/* Payroll Section */}
                <div className="nav-section">
                    <div className="nav-section-title">PAYROLL</div>
                    <button
                        className={`nav-item ${activeTab === 'payslips' ? 'active' : ''}`}
                        onClick={() => {
                            navigate('/dashboard/employee');
                            setActiveTab('payslips');
                        }}
                    >
                        <span className="nav-icon">💰</span>
                        <span>My Payslips</span>
                    </button>
                </div>

                <button className="nav-item" onClick={logout}>
                    <span className="nav-icon">🚪</span>
                    <span>Logout</span>
                </button>
            </nav>
        </div>
    );
};

export default EmployeeNavigation;
