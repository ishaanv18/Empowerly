import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-gradient"></div>
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3 className="footer-title gradient-text">🚀 Empowerly</h3>
                        <p className="footer-description">
                            Empowering teams with intelligent employee management solutions.
                            Streamline attendance, manage leaves, and boost productivity.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-link" aria-label="Twitter">🐦</a>
                            <a href="#" className="social-link" aria-label="LinkedIn">💼</a>
                            <a href="#" className="social-link" aria-label="GitHub">🐙</a>
                            <a href="#" className="social-link" aria-label="Email">📧</a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-heading">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/features">Features</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="/signin">Sign In</Link></li>
                            <li><Link to="/signup">Sign Up</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-heading">Features</h4>
                        <ul className="footer-links">
                            <li><a href="#attendance">Attendance Tracking</a></li>
                            <li><a href="#leave">Leave Management</a></li>
                            <li><a href="#dashboard">Role-Based Dashboards</a></li>
                            <li><a href="#chatbot">AI Assistant</a></li>
                            <li><a href="#analytics">Analytics & Reports</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-heading">Resources</h4>
                        <ul className="footer-links">
                            <li><a href="#docs">Documentation</a></li>
                            <li><a href="#api">API Reference</a></li>
                            <li><a href="#support">Support Center</a></li>
                            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                            <li><Link to="/terms-of-service">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4 className="footer-heading">Contact</h4>
                        <ul className="footer-contact">
                            <li>📧 support@empowerly.com</li>
                            <li>📞 +1 (555) 123-4567</li>
                            <li>📍 123 Business St, Tech City</li>
                            <li>🕐 Mon-Fri: 9AM - 6PM</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} Empowerly. All rights reserved.</p>
                    <p>Made with ❤️ for better workforce management</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
