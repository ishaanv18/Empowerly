import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Home, Star, Phone, LayoutDashboard, LogIn, UserPlus, LogOut, Menu, X, Rocket, Sun, Moon, Smartphone } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const { isAuthenticated, logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardRoute = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'ADMIN': return '/dashboard/admin';
            case 'HR': return '/dashboard/hr';
            case 'EMPLOYEE': return '/dashboard/employee';
            default: return '/';
        }
    };

    const navItems = [
        { name: 'Home', path: '/', icon: <Home size={18} /> },
        { name: 'Features', path: '/features', icon: <Star size={18} /> },
        { name: 'Contact', path: '/contact', icon: <Phone size={18} /> },
        { name: '📱 App', path: '/download', icon: <Smartphone size={18} /> }
    ];

    if (isAuthenticated()) {
        navItems.push({ name: 'Dashboard', path: getDashboardRoute(), icon: <LayoutDashboard size={18} /> });
    }

    return (
        <motion.nav
            className={`modern-navbar ${isScrolled ? 'scrolled' : ''}`}
            initial={{ y: -100, x: "-50%" }}
            animate={{ y: 0, x: "-50%" }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        >
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="modern-logo" onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.div
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                        className="logo-icon-wrapper"
                    >
                        <Rocket size={24} color="white" />
                    </motion.div>
                    <span className="logo-text">Empowerly</span>
                </Link>

                {/* Desktop Menu */}
                <div className="desktop-menu">
                    {navItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <AnimatePresence>
                                    {hoveredIndex === index && (
                                        <motion.div
                                            className="nav-item-highlight"
                                            layoutId="nav-highlight"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </AnimatePresence>
                                <span className="nav-item-content">
                                    {item.icon}
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Right Actions */}
                <div className="navbar-actions">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        className="theme-btn"
                        aria-label="Toggle theme"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={theme}
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </motion.div>
                        </AnimatePresence>
                    </motion.button>

                    <div className="auth-buttons">
                        {isAuthenticated() ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLogout}
                                className="action-btn logout-btn"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </motion.button>
                        ) : (
                            <>
                                <Link to="/signin">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="action-btn signin-btn"
                                    >
                                        <LogIn size={18} />
                                        <span>Sign In</span>
                                    </motion.button>
                                </Link>
                                <Link to="/signup">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="action-btn signup-btn"
                                    >
                                        <UserPlus size={18} />
                                        <span>Get Started</span>
                                    </motion.button>
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        className="mobile-toggle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="mobile-menu"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mobile-menu-inner">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))}
                            <div className="mobile-auth-buttons">
                                {isAuthenticated() ? (
                                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="mobile-action-btn logout-btn">
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                ) : (
                                    <>
                                        <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                                            <button className="mobile-action-btn signin-btn">
                                                <LogIn size={18} />
                                                Sign In
                                            </button>
                                        </Link>
                                        <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                                            <button className="mobile-action-btn signup-btn">
                                                <UserPlus size={18} />
                                                Get Started
                                            </button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
