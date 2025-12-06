import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './DashboardLayout.css';

const DashboardLayout = ({ children, title }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('');

    useEffect(() => {
        // Get the tab from URL params
        const tab = searchParams.get('tab') || 'overview';
        setActiveTab(tab);
    }, [searchParams]);

    const handleNavigation = (path, tab) => {
        // Check if we're navigating within the dashboard
        if (path.startsWith('/dashboard/')) {
            // Use query params for tab switching
            navigate(`${path}?tab=${tab}`);
        } else {
            // Navigate to different route
            navigate(path);
        }
        setActiveTab(tab);
    };

    const handleTabSwitch = (tab) => {
        // For dashboard routes, just update the query param
        if (location.pathname.startsWith('/dashboard/')) {
            setSearchParams({ tab });
            setActiveTab(tab);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className="dashboard-sidebar">
                <div className="sidebar-header">
                    <h2 className="sidebar-title">Empowerly</h2>
                    <p className="sidebar-subtitle">{user?.role}</p>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className="nav-item"
                        onClick={() => handleNavigation(`/dashboard/${user?.role?.toLowerCase()}`, 'overview')}
                    >
                        <span className="nav-icon">🏠</span>
                        <span>Dashboard</span>
                    </button>

                    {/* Common navigation for all roles */}
                    {(user?.role === 'EMPLOYEE' || user?.role === 'HR' || user?.role === 'ADMIN') && (
                        <>
                            <button
                                className="nav-item"
                                onClick={() => handleNavigation('/dashboard/employee', 'attendance')}
                            >
                                <span className="nav-icon">📅</span>
                                <span>Attendance</span>
                            </button>

                            <button
                                className="nav-item"
                                onClick={() => handleNavigation('/dashboard/employee', 'leaves')}
                            >
                                <span className="nav-icon">🌴</span>
                                <span>Leaves</span>
                            </button>

                            <button
                                className="nav-item"
                                onClick={() => handleNavigation('/dashboard/employee', 'chat')}
                            >
                                <span className="nav-icon">💬</span>
                                <span>Chat</span>
                            </button>

                            <button
                                className="nav-item"
                                onClick={() => handleNavigation('/dashboard/employee', 'meetings')}
                            >
                                <span className="nav-icon">📹</span>
                                <span>Meetings</span>
                            </button>
                        </>
                    )}

                    {/* Performance Review Section - Employee */}
                    {(user?.role === 'EMPLOYEE' || user?.role === 'HR' || user?.role === 'ADMIN') && (
                        <div className="nav-section">
                            <div className="nav-section-title">PERFORMANCE</div>

                            <button
                                className="nav-item"
                                onClick={() => handleNavigation('/employee/apply-review', 'apply-review')}
                            >
                                <span className="nav-icon">📝</span>
                                <span>Apply for Review</span>
                            </button>

                            <button
                                className="nav-item"
                                onClick={() => handleNavigation('/employee/my-reviews', 'my-reviews')}
                            >
                                <span className="nav-icon">📊</span>
                                <span>My Reviews</span>
                            </button>
                        </div>
                    )}

                    {/* HR Performance Section */}
                    {(user?.role === 'HR' || user?.role === 'ADMIN') && (
                        <div className="nav-section">
                            <div className="nav-section-title">HR - REVIEWS</div>

                            <button
                                className="nav-item"
                                onClick={() => handleNavigation('/hr/cycles', 'cycles')}
                            >
                                <span className="nav-icon">🔄</span>
                                <span>Manage Cycles</span>
                            </button>

                            <button
                                className="nav-item"
                                onClick={() => handleNavigation('/hr/reviews', 'reviews')}
                            >
                                <span className="nav-icon">👥</span>
                                <span>Review Dashboard</span>
                            </button>
                        </div>
                    )}

                    {/* Payroll Section - Employee */}
                    {(user?.role === 'EMPLOYEE' || user?.role === 'HR' || user?.role === 'ADMIN') && (
                        <div className="nav-section">
                            <div className="nav-section-title">PAYROLL</div>

                            <button
                                className="nav-item"
                                onClick={() => {
                                    if (user?.role === 'HR' || user?.role === 'ADMIN') {
                                        handleNavigation('/dashboard/hr', 'payroll');
                                    } else {
                                        handleNavigation('/dashboard/employee', 'payslips');
                                    }
                                }}
                            >
                                <span className="nav-icon">💰</span>
                                <span>My Payslips</span>
                            </button>
                        </div>
                    )}

                    {/* HR Payroll Section */}
                    {(user?.role === 'HR' || user?.role === 'ADMIN') && (
                        <div className="nav-section">
                            <div className="nav-section-title">HR - PAYROLL</div>

                            <button
                                className="nav-item"
                                onClick={() => handleNavigation('/hr/payroll', 'payroll')}
                            >
                                <span className="nav-icon">💼</span>
                                <span>Manage Payroll</span>
                            </button>
                        </div>
                    )}

                    {/* Admin Section */}
                    {user?.role === 'ADMIN' && (
                        <div className="nav-section">
                            <div className="nav-section-title">ADMIN</div>

                            <button
                                className="nav-item"
                                onClick={() => handleNavigation('/admin/payroll', 'admin-payroll')}
                            >
                                <span className="nav-icon">✅</span>
                                <span>Approve Payroll</span>
                            </button>

                            <button
                                className="nav-item"
                                onClick={() => handleNavigation('/admin/salary-structures', 'salary-structures')}
                            >
                                <span className="nav-icon">💵</span>
                                <span>Salary Structures</span>
                            </button>
                        </div>
                    )}

                    <button className="nav-item" onClick={logout}>
                        <span className="nav-icon">🚪</span>
                        <span>Logout</span>
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="dashboard-main">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">{title || 'Dashboard'}</h1>
                        <p className="dashboard-subtitle">{user?.department}</p>
                    </div>
                </div>

                <div className="dashboard-content">
                    {children}
                </div>
            </div >
        </div >
    );
};

export default DashboardLayout;
