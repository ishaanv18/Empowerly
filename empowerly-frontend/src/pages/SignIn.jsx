import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './SignIn.css';

const SignIn = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.login(formData);
            login(response.data);

            // Redirect based on role
            const role = response.data.role;
            if (role === 'ADMIN') {
                navigate('/dashboard/admin');
            } else if (role === 'HR') {
                navigate('/dashboard/hr');
            } else {
                navigate('/dashboard/employee');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signin-page">
            <div className="signin-container">
                <motion.div
                    className="signin-card glass"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="signin-header">
                        <h2 className="signin-title gradient-text">Welcome Back</h2>
                        <p className="signin-subtitle">Sign in to your account</p>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className="input-field"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="input-field"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="signin-footer">
                        <p>
                            Don't have an account? <Link to="/signup">Sign Up</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SignIn;
