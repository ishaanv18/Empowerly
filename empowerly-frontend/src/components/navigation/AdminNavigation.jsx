import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../pages/dashboards/Dashboard.css';

const AdminNavigation = ({ activeTab, setActiveTab, chatUnreadCount }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="dashboard-sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-title">Empowerly</h2>
                <p className="sidebar-subtitle">ADMIN</p>
            </div>

            <nav className="sidebar-nav">
                {/* Main Navigation */}
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
                    <span>My Attendance</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'leaves' ? 'active' : ''}`}
                    onClick={() => setActiveTab('leaves')}
                >
                    <span className="nav-icon">🌴</span>
                    <span>My Leaves</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chat')}
                >
                    <span className="nav-icon">💬</span>
                    <span>Chat</span>
                    {chatUnreadCount > 0 && (
                        <span className="notification-badge">{chatUnreadCount}</span>
                    )}
                </button>

                <button
                    className={`nav-item ${activeTab === 'meetings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('meetings')}
                >
                    <span className="nav-icon">📹</span>
                    <span>Meetings</span>
                </button>

                {/* Performance Section */}
                <div className="nav-section">
                    <div className="nav-section-title">PERFORMANCE</div>
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

                {/* Payroll Section */}
                <div className="nav-section">
                    <div className="nav-section-title">PAYROLL</div>
                </div>

                <button
                    className={`nav-item ${activeTab === 'my-payslips' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-payslips')}
                >
                    <span className="nav-icon">💰</span>
                    <span>My Payslips</span>
                </button>

                {/* Admin - Payroll Section */}
                <div className="nav-section">
                    <div className="nav-section-title">ADMIN - PAYROLL</div>
                </div>

                <button
                    className={`nav-item ${activeTab === 'approve-payroll' ? 'active' : ''}`}
                    onClick={() => setActiveTab('approve-payroll')}
                >
                    <span className="nav-icon">✅</span>
                    <span>Approve Payroll</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'salary-structures' ? 'active' : ''}`}
                    onClick={() => setActiveTab('salary-structures')}
                >
                    <span className="nav-icon">💵</span>
                    <span>Salary Structures</span>
                </button>

                {/* Admin - System Management */}
                <div className="nav-section">
                    <div className="nav-section-title">SYSTEM MANAGEMENT</div>
                </div>

                <button
                    className={`nav-item ${activeTab === 'user-management' ? 'active' : ''}`}
                    onClick={() => setActiveTab('user-management')}
                >
                    <span className="nav-icon">👥</span>
                    <span>User Management</span>
                </button>

                {/* Admin - Reports & Analytics */}
                <div className="nav-section">
                    <div className="nav-section-title">REPORTS & ANALYTICS</div>
                </div>

                <button
                    className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    <span className="nav-icon">📈</span>
                    <span>Analytics Dashboard</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                >
                    <span className="nav-icon">📄</span>
                    <span>Generate Reports</span>
                </button>

                <button
                    className={`nav-item ${activeTab === 'audit-logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('audit-logs')}
                >
                    <span className="nav-icon">🔍</span>
                    <span>Audit Logs</span>
                </button>

                {/* Logout Button */}
                <button
                    className="nav-item logout-btn"
                    onClick={logout}
                    style={{ marginTop: 'auto', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}
                >
                    <span className="nav-icon">🚪</span>
                    <span>Logout</span>
                </button>
            </nav>
        </div>
    );
};

export default AdminNavigation;
