import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import BackgroundAnimation from '../components/animations/BackgroundAnimation';
import './Home.css';

const Home = () => {
    const { scrollYProgress } = useScroll();
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);

    const [typedText, setTypedText] = useState('');
    const fullText = "Empower Your Workforce";

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
            title: 'Smart Attendance',
            description: 'Real-time check-in/out with geolocation, timeline visualization, and automated tracking',
            color: '#667eea'
        },
        {
            icon: '📝',
            title: 'Leave Management',
            description: 'Streamlined leave requests with instant approval workflows and automated notifications',
            color: '#764ba2'
        },
        {
            icon: '👥',
            title: 'Role-Based Access',
            description: 'Customized dashboards for Admin, HR, and Employee roles with granular permissions',
            color: '#f093fb'
        },
        {
            icon: '🤖',
            title: 'AI Assistant - Sahaayak',
            description: 'Intelligent chatbot powered by Gemini AI for instant help and smart responses',
            color: '#4facfe'
        },
        {
            icon: '✨',
            title: 'AI Quote Generator',
            description: 'Generate inspirational quotes for motivation wall using advanced AI',
            color: '#c471ed'
        },
        {
            icon: '🎓',
            title: 'AI Skill Development',
            description: 'Personalized skill suggestions and course recommendations powered by AI',
            color: '#12c2e9'
        },
        {
            icon: '📊',
            title: 'AI Performance Insights',
            description: 'Auto-generated performance feedback with improvement suggestions and analytics',
            color: '#43e97b'
        },
        {
            icon: '🔒',
            title: 'Security & Monitoring',
            description: 'Session recording, login pattern analysis, automated security alerts, and auto-logout after 15 minutes of inactivity',
            color: '#fa709a'
        },
        {
            icon: '💰',
            title: 'Payroll Management',
            description: 'Automated salary processing with tax calculations and payslip generation',
            color: '#fee140'
        },
        {
            icon: '📄',
            title: 'Document Generation',
            description: 'Create offer letters and appointment letters instantly with AI assistance',
            color: '#30cfd0'
        },
        {
            icon: '🎯',
            title: 'Performance Reviews',
            description: 'Comprehensive review cycles with self-assessment and HR evaluation',
            color: '#a8edea'
        },
        {
            icon: '💬',
            title: 'Feedback System',
            description: 'Anonymous and public feedback with sentiment analysis and auto-archiving',
            color: '#ff6b6b'
        },
        {
            icon: '💪',
            title: 'Motivation Wall',
            description: 'Social engagement platform with posts, likes, comments, and AI-generated quotes',
            color: '#f093fb'
        },
        {
            icon: '📹',
            title: 'Video Meetings',
            description: 'Integrated WebRTC video conferencing with screen sharing and recording',
            color: '#c471ed'
        },
        {
            icon: '💬',
            title: 'Real-time Chat',
            description: 'Instant messaging with file sharing, emojis, and message history',
            color: '#12c2e9'
        },
        {
            icon: '📈',
            title: 'Advanced Analytics',
            description: 'Comprehensive reports and insights for data-driven decisions',
            color: '#43e97b'
        }
    ];

    const steps = [
        {
            number: '01',
            title: 'Sign Up',
            description: 'Create your account in under 2 minutes with email verification',
            icon: '✨'
        },
        {
            number: '02',
            title: 'Set Up',
            description: 'Configure your organization structure and invite team members',
            icon: '⚙️'
        },
        {
            number: '03',
            title: 'Onboard',
            description: 'Add employees, assign roles, and customize workflows',
            icon: '🚀'
        },
        {
            number: '04',
            title: 'Manage',
            description: 'Track attendance, approve leaves, and generate reports effortlessly',
            icon: '📊'
        }
    ];

    const benefits = [
        {
            category: 'For Employees',
            items: [
                'Easy clock-in/out from anywhere',
                'Quick leave requests and approvals',
                'Access to payslips and documents',
                'AI chatbot for instant support',
                'Performance tracking and feedback'
            ],
            icon: '👤',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            category: 'For HR Teams',
            items: [
                'Centralized employee management',
                'Automated document generation',
                'Comprehensive analytics dashboard',
                'Leave and attendance oversight',
                'Audit logs for compliance'
            ],
            icon: '👥',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
            category: 'For Administrators',
            items: [
                'Complete system control',
                'User management and permissions',
                'Organization-wide insights',
                'Security and compliance tools',
                'Customizable workflows'
            ],
            icon: '⚡',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        }
    ];

    const testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'HR Manager at TechCorp',
            content: 'Empowerly transformed our HR operations. The automated workflows saved us 20+ hours per week!',
            rating: 5,
            avatar: '👩‍💼'
        },
        {
            name: 'Michael Chen',
            role: 'CEO at StartupXYZ',
            content: 'The best employee management platform we\'ve used. Intuitive, powerful, and beautiful design.',
            rating: 5,
            avatar: '👨‍💼'
        },
        {
            name: 'Emily Rodriguez',
            role: 'Operations Lead',
            content: 'The AI assistant is a game-changer. Our employees love how easy it is to get instant answers.',
            rating: 5,
            avatar: '👩‍💻'
        }
    ];

    const techStack = [
        { name: 'React', icon: '⚛️', color: '#61dafb' },
        { name: 'Spring Boot', icon: '🍃', color: '#6db33f' },
        { name: 'MongoDB', icon: '🍃', color: '#47a248' },
        { name: 'JWT Auth', icon: '🔐', color: '#000000' },
        { name: 'Gemini AI', icon: '✨', color: '#4285f4' },
        { name: 'WebRTC', icon: '📹', color: '#ff6b6b' }
    ];

    const faqs = [
        {
            question: 'How secure is Empowerly?',
            answer: 'We use bank-grade encryption, JWT authentication, OTP verification, automatic logout after 15 minutes of inactivity, and regular security audits to ensure your data is completely secure.'
        },
        {
            question: 'Can I integrate with existing tools?',
            answer: 'Yes! Empowerly offers API access and integrations with popular tools like Slack, Google Workspace, and more.'
        },
        {
            question: 'Is there a mobile app?',
            answer: 'Our platform is fully responsive and works seamlessly on all devices. Native mobile apps are coming soon!'
        },
        {
            question: 'What kind of support do you offer?',
            answer: 'We provide 24/7 customer support via chat, email, and our AI assistant Sahaayak for instant help.'
        },
        {
            question: 'How does pricing work?',
            answer: 'We offer flexible plans based on your team size. Start with our free tier and upgrade as you grow.'
        }
    ];

    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="home">
            <BackgroundAnimation />

            {/* Enhanced Hero Section */}
            <section className="hero">
                <div className="hero-gradient-orbs">
                    <div className="orb orb-1"></div>
                    <div className="orb orb-2"></div>
                    <div className="orb orb-3"></div>
                </div>

                <div className="container">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            className="hero-badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            🎉 Trusted by 10,000+ Companies Worldwide
                        </motion.div>

                        <h1 className="hero-title">
                            <span className="typewriter">{typedText}</span>
                            <br />
                            <span className="gradient-text">with Empowerly</span>
                        </h1>

                        <p className="hero-description">
                            The ultimate employee management platform that combines attendance tracking,
                            leave management, payroll, and AI-powered assistance in one beautiful interface.
                        </p>

                        <div className="hero-buttons">
                            <Link to="/signup">
                                <motion.button
                                    className="btn btn-primary btn-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Get Started Free 🚀
                                </motion.button>
                            </Link>
                            <Link to="/features">
                                <motion.button
                                    className="btn btn-secondary btn-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Watch Demo 📹
                                </motion.button>
                            </Link>
                        </div>

                        <div className="hero-stats">
                            <motion.div
                                className="stat-item"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h3 className="stat-number gradient-text">10K+</h3>
                                <p className="stat-label">Active Users</p>
                            </motion.div>
                            <motion.div
                                className="stat-item"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <h3 className="stat-number gradient-text">99.9%</h3>
                                <p className="stat-label">Uptime</p>
                            </motion.div>
                            <motion.div
                                className="stat-item"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <h3 className="stat-number gradient-text">24/7</h3>
                                <p className="stat-label">Support</p>
                            </motion.div>
                            <motion.div
                                className="stat-item"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <h3 className="stat-number gradient-text">500+</h3>
                                <p className="stat-label">Companies</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">Powerful Features</h2>
                        <p className="section-description">
                            Everything you need to manage your workforce efficiently
                        </p>
                    </motion.div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="feature-card glass"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                            >
                                <div className="feature-icon" style={{ background: feature.color }}>
                                    {feature.icon}
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                                <div className="feature-gradient-border" style={{ background: feature.color }}></div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">How It Works</h2>
                        <p className="section-description">
                            Get started in 4 simple steps
                        </p>
                    </motion.div>

                    <div className="steps-timeline">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                className="step-card glass"
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <div className="step-number gradient-text">{step.number}</div>
                                <div className="step-icon">{step.icon}</div>
                                <h3 className="step-title">{step.title}</h3>
                                <p className="step-description">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="benefits-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">Benefits for Everyone</h2>
                        <p className="section-description">
                            Designed to empower every role in your organization
                        </p>
                    </motion.div>

                    <div className="benefits-grid">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                className="benefit-card glass"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="benefit-icon" style={{ background: benefit.gradient }}>
                                    {benefit.icon}
                                </div>
                                <h3 className="benefit-category">{benefit.category}</h3>
                                <ul className="benefit-list">
                                    {benefit.items.map((item, i) => (
                                        <li key={i}>✓ {item}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology Stack Section */}
            <section className="tech-stack-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">Built with Modern Technology</h2>
                        <p className="section-description">
                            Powered by industry-leading technologies
                        </p>
                    </motion.div>

                    <div className="tech-grid">
                        {techStack.map((tech, index) => (
                            <motion.div
                                key={index}
                                className="tech-card glass"
                                initial={{ opacity: 0, rotate: -10 }}
                                whileInView={{ opacity: 1, rotate: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                <div className="tech-icon" style={{ color: tech.color }}>
                                    {tech.icon}
                                </div>
                                <p className="tech-name">{tech.name}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">Loved by Teams Worldwide</h2>
                        <p className="section-description">
                            See what our customers have to say
                        </p>
                    </motion.div>

                    <div className="testimonials-grid">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                className="testimonial-card glass"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <div className="testimonial-rating">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <span key={i} className="star">⭐</span>
                                    ))}
                                </div>
                                <p className="testimonial-content">"{testimonial.content}"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">{testimonial.avatar}</div>
                                    <div>
                                        <p className="author-name">{testimonial.name}</p>
                                        <p className="author-role">{testimonial.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">Frequently Asked Questions</h2>
                        <p className="section-description">
                            Got questions? We've got answers
                        </p>
                    </motion.div>

                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                className="faq-item glass"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div
                                    className="faq-question"
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                >
                                    <h3>{faq.question}</h3>
                                    <span className={`faq-icon ${openFaq === index ? 'open' : ''}`}>
                                        {openFaq === index ? '−' : '+'}
                                    </span>
                                </div>
                                <motion.div
                                    className="faq-answer"
                                    initial={false}
                                    animate={{ height: openFaq === index ? 'auto' : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <p>{faq.answer}</p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <motion.div
                        className="cta-content glass"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="cta-title">Ready to Transform Your Workplace?</h2>
                        <p className="cta-description">
                            Join thousands of companies already using Empowerly to streamline their operations
                        </p>
                        <Link to="/signup">
                            <motion.button
                                className="btn btn-accent btn-lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Start Your Free Trial Today 🚀
                            </motion.button>
                        </Link>
                        <p className="cta-note">No credit card required • 14-day free trial • Cancel anytime</p>
                    </motion.div>
                </div>
            </section>

            {/* Social Media Section */}
            <section className="social-footer-section">
                <div className="container">
                    <motion.div
                        className="social-section"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="social-title">Connect with the Developer</h3>
                        <div className="social-links">
                            <motion.a
                                href="https://github.com/ishaanv18"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-btn github-btn"
                                whileHover={{ scale: 1.05, translateY: -5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="icon-wrapper">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </div>
                                <span>GitHub</span>
                            </motion.a>

                            <motion.a
                                href="https://www.linkedin.com/in/ishaan-verma-03s/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-btn linkedin-btn"
                                whileHover={{ scale: 1.05, translateY: -5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="icon-wrapper">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </div>
                                <span>LinkedIn</span>
                            </motion.a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};


export default Home;

