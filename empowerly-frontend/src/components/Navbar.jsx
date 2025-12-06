import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardRoute = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'ADMIN':
                return '/dashboard/admin';
            case 'HR':
                return '/dashboard/hr';
            case 'EMPLOYEE':
                return '/dashboard/employee';
            default:
                return '/';
        }
    };

    return (
        <nav className="navbar glass">
            <div className="container navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🚀</span>
                    <span className="logo-text gradient-text">Empowerly</span>
                </Link>

                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Home
                    </Link>
                    <Link to="/features" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Features
                    </Link>
                    <Link to="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Contact Us
                    </Link>

                    {isAuthenticated() ? (
                        <>
                            <Link to={getDashboardRoute()} className="nav-link" onClick={() => setIsMenuOpen(false)}>
                                Dashboard
                            </Link>
                            <button onClick={handleLogout} className="btn btn-secondary">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/signin" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                                Sign In
                            </Link>
                            <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                                <button className="btn btn-primary">Sign Up</button>
                            </Link>
                        </>
                    )}

                    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>

                <button
                    className="menu-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
