import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Features.css';

const Features = () => {
    const [typedText, setTypedText] = useState('');
    const fullText = "Modern Teams";

    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            if (index <= fullText.length) {
                setTypedText(fullText.slice(0, index));
                index++;
            } else {
                clearInterval(timer);
            }
        }, 100);
        return () => clearInterval(timer);
    }, []);

    const features = [
        {
            icon: '⏰',
            title: 'Smart Attendance Tracking',
            description: 'Real-time check-in and check-out with geolocation tracking, timeline visualization, and automated duration calculations.',
            benefits: ['One-click check-in/out', 'Timeline view with geolocation', 'Monthly reports and analytics', 'Automatic duration calculation', 'Late check-in alerts']
        },
        {
            icon: '📝',
            title: 'Leave Management System',
            description: 'Comprehensive leave management with multiple leave types, approval workflows, and real-time status tracking.',
            benefits: ['Quick leave application', 'Real-time status tracking', 'HR feedback and remarks', 'Leave history and balance', 'Automated notifications']
        },
        {
            icon: '👥',
            title: 'Role-Based Dashboards',
            description: 'Customized dashboards for Admin, HR, and Employees with appropriate access controls and personalized views.',
            benefits: ['Admin system controls', 'HR management tools', 'Employee self-service portal', 'Secure role-based access', 'Customizable workflows']
        },
        {
            icon: '🤖',
            title: 'AI Assistant - Sahaayak',
            description: 'Intelligent chatbot powered by Gemini AI that provides instant help, answers questions, and guides users 24/7.',
            benefits: ['Instant AI responses', 'Context-aware assistance', 'Always available 24/7', 'Powered by Gemini 2.0 Flash', 'Natural language understanding']
        },
        {
            icon: '✨',
            title: 'AI Quote Generator',
            description: 'Generate inspirational and motivational quotes using advanced AI for the motivation wall and team engagement.',
            benefits: ['AI-powered quote generation', 'Category-based quotes', 'Instant generation', 'Professional and inspiring', 'Gemini AI integration']
        },
        {
            icon: '🎓',
            title: 'AI Skill Development',
            description: 'Personalized skill suggestions and course recommendations based on your role, department, and career goals.',
            benefits: ['AI-powered skill analysis', 'Personalized course recommendations', 'Progress tracking', 'Career development paths', 'Industry-relevant skills']
        },
        {
            icon: '📊',
            title: 'AI Performance Insights',
            description: 'Auto-generated performance feedback analyzing attendance, reviews, and feedback to provide actionable insights.',
            benefits: ['AI-generated feedback summaries', 'Improvement percentage tracking', 'Strengths identification', 'Areas for improvement', 'Historical insight tracking']
        },
        {
            icon: '🔒',
            title: 'Security & Monitoring',
            description: 'Comprehensive security system with session recording, login pattern analysis, automated threat detection, and automatic logout after 15 minutes of inactivity.',
            benefits: ['Session activity tracking', 'Unusual login detection', 'Failed attempt monitoring', 'Security alert system', 'Auto-logout after 15 min inactivity', 'Admin-only access controls']
        },
        {
            icon: '💰',
            title: 'Payroll Management',
            description: 'Automated salary processing with tax calculations, deductions, and instant payslip generation.',
            benefits: ['Automated salary calculation', 'Tax and deduction management', 'Instant payslip generation', 'Payment history tracking', 'Bulk processing']
        },
        {
            icon: '📄',
            title: 'Document Generation',
            description: 'Create professional offer letters and appointment letters instantly with customizable templates.',
            benefits: ['Instant document creation', 'Professional templates', 'PDF generation', 'Document history', 'Bulk generation support']
        },
        {
            icon: '🎯',
            title: 'Performance Review System',
            description: 'Comprehensive performance review cycles with self-assessment, HR evaluation, and goal tracking.',
            benefits: ['Review cycle management', 'Self-assessment forms', 'HR evaluation tools', 'Goal setting and tracking', 'Performance analytics']
        },
        {
            icon: '💬',
            title: 'Feedback System',
            description: 'Anonymous and public feedback system with sentiment analysis and automatic archiving.',
            benefits: ['Anonymous feedback option', 'Public feedback sharing', 'Sentiment analysis', 'Auto-archiving old feedback', 'HR management dashboard']
        },
        {
            icon: '💪',
            title: 'Motivation Wall',
            description: 'Social engagement platform for team motivation with posts, likes, comments, and AI-generated content.',
            benefits: ['Create motivational posts', 'Like and comment system', 'AI quote generation', 'Category-based filtering', 'Content moderation']
        },
        {
            icon: '📹',
            title: 'Video Meetings',
            description: 'Integrated WebRTC video conferencing with screen sharing, recording, and meeting management.',
            benefits: ['HD video conferencing', 'Screen sharing', 'Meeting recording', 'Participant management', 'Meeting history']
        },
        {
            icon: '💬',
            title: 'Real-time Chat',
            description: 'Instant messaging system with file sharing, emojis, message history, and read receipts.',
            benefits: ['Instant messaging', 'File sharing support', 'Emoji reactions', 'Message history', 'Unread message tracking']
        },
        {
            icon: '🔐',
            title: 'Enterprise Security',
            description: 'Bank-grade security with OTP verification, JWT authentication, encrypted data storage, audit logs, and automatic session timeout.',
            benefits: ['OTP email verification', 'JWT token authentication', 'Encrypted MongoDB storage', 'Audit logs', 'Auto-logout after 15 min inactivity', 'Session management']
        }
    ];

    return (
        <div className="features-page">
            <div className="container">
                <motion.div
                    className="features-hero"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="features-title">
                        Powerful Features for <span className="gradient-text typewriter">{typedText}</span>
                    </h1>
                    <p className="features-description">
                        Everything you need to manage your workforce efficiently, all in one place
                    </p>
                </motion.div>

                <div className="features-list">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="feature-item card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="feature-icon-large">{feature.icon}</div>
                            <div className="feature-content">
                                <h3 className="feature-item-title">{feature.title}</h3>
                                <p className="feature-item-description">{feature.description}</p>
                                <ul className="feature-benefits">
                                    {feature.benefits.map((benefit, i) => (
                                        <li key={i}>✓ {benefit}</li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Features;
