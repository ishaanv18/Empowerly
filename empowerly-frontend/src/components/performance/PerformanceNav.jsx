import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './PerformanceNav.css';

const PerformanceNav = () => {
    const { user } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="performance-nav">
            <h3>📊 Performance Reviews</h3>
            <div className="performance-links">
                {/* HR Links */}
                {(user?.role === 'HR' || user?.role === 'ADMIN') && (
                    <>
                        <Link
                            to="/hr/cycles"
                            className={`perf-link ${isActive('/hr/cycles') ? 'active' : ''}`}
                        >
                            <span className="icon">🔄</span>
                            <span>Manage Cycles</span>
                        </Link>
                        <Link
                            to="/hr/reviews"
                            className={`perf-link ${isActive('/hr/reviews') ? 'active' : ''}`}
                        >
                            <span className="icon">👥</span>
                            <span>Review Dashboard</span>
                        </Link>
                    </>
                )}

                {/* Admin Links */}
                {user?.role === 'ADMIN' && (
                    <Link
                        to="/admin/reviews"
                        className={`perf-link ${isActive('/admin/reviews') ? 'active' : ''}`}
                    >
                        <span className="icon">⚙️</span>
                        <span>Admin Settings</span>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default PerformanceNav;
