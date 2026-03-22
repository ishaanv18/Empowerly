import React, { useState } from 'react';
import './DownloadPage.css';

const FEATURES = [
    { icon: '📅', title: 'Attendance Tracking', desc: 'Clock in/out with a single tap. Track your daily work hours effortlessly.' },
    { icon: '🏖️', title: 'Leave Management', desc: 'Apply for leaves, track balances and get real-time approval status.' },
    { icon: '💰', title: 'Payslip Access', desc: 'View and download your monthly payslips anytime, anywhere.' },
    { icon: '⭐', title: 'Performance Reviews', desc: 'Submit self-assessments and track your performance cycle progress.' },
    { icon: '💬', title: 'Team Chat', desc: 'Connect with colleagues through the built-in messaging system.' },
    { icon: '🤖', title: 'AI HR Chatbot', desc: 'Get instant answers to HR queries from our intelligent assistant.' },
    { icon: '🔥', title: 'Motivation Wall', desc: 'Share achievements and celebrate wins with your whole team.' },
    { icon: '🧠', title: 'Skill Development', desc: 'Get AI-powered personalized skill recommendations to grow your career.' },
];

export default function DownloadPage() {
    const [copied, setCopied] = useState(false);
    const PWA_URL = window.location.origin;

    const handleCopyURL = () => {
        navigator.clipboard.writeText(PWA_URL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="download-page">
            {/* Hero */}
            <div className="dl-hero">
                <div className="dl-hero-content">
                    <div className="dl-app-icon">⚡</div>
                    <h1>Empowerly Mobile</h1>
                    <p className="dl-subtitle">Your HR workspace, always in your pocket.</p>
                    <p className="dl-tagline">Available for Android & iOS — <strong>completely free</strong>.</p>
                    <div className="dl-badges">
                        <span className="dl-badge dl-badge-free">Free Forever</span>
                        <span className="dl-badge dl-badge-roles">Role-Based Access</span>
                        <span className="dl-badge dl-badge-secure">Secure & Private</span>
                    </div>
                </div>
                <div className="dl-phone-mockup">
                    <div className="dl-phone">
                        <div className="dl-phone-screen">
                            <div className="dl-mock-header">
                                <span>⚡</span>
                                <span className="dl-mock-title">Empowerly</span>
                            </div>
                            <div className="dl-mock-stat">📅 7 Leaves Left</div>
                            <div className="dl-mock-stat">✅ Checked In 9:02 AM</div>
                            <div className="dl-mock-stat">⭐ Review Due in 3 days</div>
                            <div className="dl-mock-btn">Quick Check-In →</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Download Options */}
            <div className="dl-section">
                <h2>Get the App</h2>
                <div className="dl-cards">
                    {/* Android */}
                    <div className="dl-card dl-card-android">
                        <div className="dl-card-icon">🤖</div>
                        <h3>Android</h3>
                        <p>Download the APK and install directly on your Android device.</p>
                        <div className="dl-steps">
                            <div className="dl-step">
                                <span className="dl-step-num">1</span>
                                <span>Enable <strong>"Install from Unknown Sources"</strong> in your phone settings</span>
                            </div>
                            <div className="dl-step">
                                <span className="dl-step-num">2</span>
                                <span>Download the APK below</span>
                            </div>
                            <div className="dl-step">
                                <span className="dl-step-num">3</span>
                                <span>Open the downloaded file and tap <strong>Install</strong></span>
                            </div>
                        </div>
                        <a
                            href="/downloads/empowerly.apk"
                            className="dl-btn dl-btn-android"
                            download
                        >
                            ⬇️ Download APK (Android)
                        </a>
                        <p className="dl-note">
                            🔒 Safe & scanned. No payment required.
                        </p>
                    </div>

                    {/* iOS */}
                    <div className="dl-card dl-card-ios">
                        <div className="dl-card-icon">🍎</div>
                        <h3>iPhone & iPad</h3>
                        <p>Add Empowerly to your iOS Home Screen as a Progressive Web App — works just like a native app.</p>
                        <div className="dl-steps">
                            <div className="dl-step">
                                <span className="dl-step-num">1</span>
                                <span>Open <strong>Safari</strong> on your iPhone/iPad and go to this website</span>
                            </div>
                            <div className="dl-step">
                                <span className="dl-step-num">2</span>
                                <span>Tap the <strong>Share</strong> icon <span className="dl-share-icon">⬆️</span> at the bottom of Safari</span>
                            </div>
                            <div className="dl-step">
                                <span className="dl-step-num">3</span>
                                <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                            </div>
                            <div className="dl-step">
                                <span className="dl-step-num">4</span>
                                <span>Tap <strong>Add</strong> in the top right — done!</span>
                            </div>
                        </div>
                        <div className="dl-url-copy">
                            <span className="dl-url-text">{PWA_URL}</span>
                            <button className="dl-btn-copy" onClick={handleCopyURL}>
                                {copied ? '✅ Copied!' : '📋 Copy URL'}
                            </button>
                        </div>
                        <p className="dl-note">
                            ✅ No App Store needed. Works offline after first visit.
                        </p>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="dl-section dl-section-dark">
                <h2>Everything You Need</h2>
                <p className="dl-section-sub">Role-based features for Employees, HR, and Admins</p>
                <div className="dl-features-grid">
                    {FEATURES.map((f) => (
                        <div className="dl-feature" key={f.title}>
                            <span className="dl-feature-icon">{f.icon}</span>
                            <div>
                                <h4>{f.title}</h4>
                                <p>{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Roles */}
            <div className="dl-section">
                <h2>Tailored for Your Role</h2>
                <div className="dl-roles">
                    <div className="dl-role dl-role-emp">
                        <h3>👤 Employee</h3>
                        <ul>
                            <li>Attendance check-in/out</li>
                            <li>Leave request & tracking</li>
                            <li>Payslip downloads</li>
                            <li>Self-assessment</li>
                            <li>Team chat</li>
                            <li>AI chatbot</li>
                            <li>Skill development</li>
                            <li>Motivation wall</li>
                        </ul>
                    </div>
                    <div className="dl-role dl-role-hr">
                        <h3>🧑‍💼 HR</h3>
                        <ul>
                            <li>Approve/reject leaves</li>
                            <li>Create payroll</li>
                            <li>Manage review cycles</li>
                            <li>User directory</li>
                            <li>Generate offer letters</li>
                            <li>Handle employee feedback</li>
                        </ul>
                    </div>
                    <div className="dl-role dl-role-admin">
                        <h3>🛡️ Admin</h3>
                        <ul>
                            <li>System dashboard</li>
                            <li>User management</li>
                            <li>Payroll approval</li>
                            <li>Security monitoring</li>
                            <li>Audit logs</li>
                            <li>Salary structure control</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="dl-section dl-section-dark">
                <h2>Frequently Asked Questions</h2>
                <div className="dl-faqs">
                    <div className="dl-faq">
                        <h4>Is the app really free?</h4>
                        <p>Yes! Empowerly Mobile is completely free to download and use. No subscription, no hidden fees.</p>
                    </div>
                    <div className="dl-faq">
                        <h4>Do I need an account?</h4>
                        <p>Yes. Use the same credentials as the Empowerly web portal, or ask your HR team to create an account for you.</p>
                    </div>
                    <div className="dl-faq">
                        <h4>Is my data safe?</h4>
                        <p>Absolutely. All data is encrypted in transit (HTTPS) and the same secure backend serves both web and mobile.</p>
                    </div>
                    <div className="dl-faq">
                        <h4>Will the app get updates?</h4>
                        <p>Yes! Android users can simply re-download the latest APK. iOS PWA users automatically get updates on refresh.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
