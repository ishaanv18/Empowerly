import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
    return (
        <div className="privacy-policy-page">
            <div className="container">
                <div className="policy-content glass">
                    <h1 className="policy-title">Privacy Policy</h1>
                    <p className="policy-updated">Last Updated: December 6, 2025</p>

                    <section className="policy-section">
                        <h2>1. Information We Collect</h2>
                        <p>
                            At Empowerly, we collect information that you provide directly to us, including:
                        </p>
                        <ul>
                            <li>Personal information (name, email address, phone number)</li>
                            <li>Employment information (job title, department, employee ID)</li>
                            <li>Attendance and leave records</li>
                            <li>Performance review data</li>
                            <li>Payroll information</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to:
                        </p>
                        <ul>
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process attendance and leave requests</li>
                            <li>Manage payroll and compensation</li>
                            <li>Conduct performance reviews</li>
                            <li>Send important notifications and updates</li>
                            <li>Ensure security and prevent fraud</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>3. Information Sharing</h2>
                        <p>
                            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                        </p>
                        <ul>
                            <li>With your employer or HR department as necessary for employment purposes</li>
                            <li>With service providers who assist in our operations</li>
                            <li>When required by law or to protect our rights</li>
                            <li>With your explicit consent</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>4. Data Security</h2>
                        <p>
                            We implement industry-standard security measures to protect your personal information, including:
                        </p>
                        <ul>
                            <li>Encryption of data in transit and at rest</li>
                            <li>Regular security audits and assessments</li>
                            <li>Access controls and authentication</li>
                            <li>Secure data storage and backup systems</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>5. Your Rights</h2>
                        <p>
                            You have the right to:
                        </p>
                        <ul>
                            <li>Access your personal information</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your data (subject to legal requirements)</li>
                            <li>Opt-out of certain data processing activities</li>
                            <li>Lodge a complaint with a supervisory authority</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>6. Cookies and Tracking</h2>
                        <p>
                            We use cookies and similar tracking technologies to enhance your experience. You can control cookie preferences through your browser settings.
                        </p>
                    </section>

                    <section className="policy-section">
                        <h2>7. Data Retention</h2>
                        <p>
                            We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
                        </p>
                    </section>

                    <section className="policy-section">
                        <h2>8. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
                        </p>
                    </section>

                    <section className="policy-section">
                        <h2>9. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <p>
                            Email: privacy@empowerly.com<br />
                            Phone: +1 (555) 123-4567<br />
                            Address: 123 Business Street, Suite 100, City, State 12345
                        </p>
                    </section>

                    <div className="policy-footer">
                        <Link to="/" className="btn btn-primary">Back to Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
