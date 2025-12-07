import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './SignUp.css';

const SignUp = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        dateOfBirth: '',
        department: '',
        role: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleStep1Submit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authAPI.signup({
                name: formData.name,
                email: formData.email,
                dateOfBirth: formData.dateOfBirth,
                department: formData.department,
                role: formData.role,
                password: formData.password
            });

            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('Please enter complete OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authAPI.verifyOTP({
                email: formData.email,
                otp: otpCode
            });

            login(response.data);

            // Show success notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                color: white;
                padding: 20px 30px;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: 'Inter', sans-serif;
                font-size: 16px;
                font-weight: 600;
                animation: slideIn 0.3s ease-out;
            `;
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 24px;">🎊</span>
                    <div>
                        <div style="font-weight: 700; margin-bottom: 4px;">Account Created!</div>
                        <div style="font-size: 14px; opacity: 0.9;">Welcome to Empowerly, ${formData.name}!</div>
                    </div>
                </div>
            `;

            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(notification);

            // Redirect after showing notification
            setTimeout(() => {
                navigate('/dashboard/employee');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            await authAPI.resendOTP(formData.email);
            alert('OTP resent successfully!');
        } catch (err) {
            setError('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                <motion.div
                    className="signup-card glass"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="signup-header">
                        <h2 className="signup-title gradient-text">Create Account</h2>
                        <p className="signup-subtitle">
                            Step {step} of 2: {step === 1 ? 'Your Information' : 'Verify Email'}
                        </p>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form
                                key="step1"
                                onSubmit={handleStep1Submit}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div className="input-group">
                                    <label className="input-label">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="input-field"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="John Doe"
                                    />
                                </div>

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
                                    <label className="input-label">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        className="input-field"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-row">
                                    <div className="input-group">
                                        <label className="input-label">Department</label>
                                        <select
                                            name="department"
                                            className="input-field"
                                            value={formData.department}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            <option value="FINANCE">Finance</option>
                                            <option value="HR">HR</option>
                                            <option value="BACKEND">Backend</option>
                                            <option value="FRONTEND">Frontend</option>
                                            <option value="DEVOPS">DevOps</option>
                                        </select>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">Role</label>
                                        <select
                                            name="role"
                                            className="input-field"
                                            value={formData.role}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Role</option>
                                            <option value="ADMIN">Admin</option>
                                            <option value="HR">HR</option>
                                            <option value="EMPLOYEE">Employee</option>
                                        </select>
                                    </div>
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
                                    <small className="input-hint">
                                        Must contain uppercase, lowercase, number, and special character
                                    </small>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="input-field"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                    {loading ? 'Processing...' : 'Next Step →'}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="step2"
                                onSubmit={handleOtpSubmit}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <p className="otp-instruction">
                                    We've sent a 6-digit verification code to <strong>{formData.email}</strong>
                                </p>

                                <div className="otp-inputs">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            maxLength="1"
                                            className="otp-input"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !digit && index > 0) {
                                                    document.getElementById(`otp-${index - 1}`)?.focus();
                                                }
                                            }}
                                        />
                                    ))}
                                </div>

                                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-secondary btn-full"
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                >
                                    Resend OTP
                                </button>

                                <button
                                    type="button"
                                    className="btn-text"
                                    onClick={() => setStep(1)}
                                >
                                    ← Back to Step 1
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="signup-footer">
                        <p>
                            Already have an account? <Link to="/signin">Sign In</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SignUp;
