import React from 'react';
import { Link } from 'react-router-dom';
import './TermsOfService.css';

const TermsOfService = () => {
    return (
        <div className="terms-of-service-page">
            <div className="container">
                <div className="terms-content glass">
                    <h1 className="terms-title">Terms of Service</h1>
                    <p className="terms-updated">Last Updated: December 6, 2025</p>

                    <section className="terms-section">
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Empowerly ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use the Service.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>2. Description of Service</h2>
                        <p>
                            Empowerly provides an employee management platform that includes:
                        </p>
                        <ul>
                            <li>Attendance tracking and management</li>
                            <li>Leave request and approval system</li>
                            <li>Payroll processing and management</li>
                            <li>Performance review and evaluation tools</li>
                            <li>Document generation and management</li>
                            <li>Real-time chat and communication features</li>
                        </ul>
                    </section>

                    <section className="terms-section">
                        <h2>3. User Accounts</h2>
                        <p>
                            To use certain features of the Service, you must register for an account. You agree to:
                        </p>
                        <ul>
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your password</li>
                            <li>Notify us immediately of any unauthorized access</li>
                            <li>Accept responsibility for all activities under your account</li>
                        </ul>
                    </section>

                    <section className="terms-section">
                        <h2>4. User Responsibilities</h2>
                        <p>
                            You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
                        </p>
                        <ul>
                            <li>Violate any applicable laws or regulations</li>
                            <li>Infringe upon the rights of others</li>
                            <li>Transmit any harmful or malicious code</li>
                            <li>Attempt to gain unauthorized access to the Service</li>
                            <li>Interfere with or disrupt the Service</li>
                            <li>Use the Service for any fraudulent purposes</li>
                        </ul>
                    </section>

                    <section className="terms-section">
                        <h2>5. Intellectual Property</h2>
                        <p>
                            The Service and its original content, features, and functionality are owned by Empowerly and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>6. Data and Privacy</h2>
                        <p>
                            Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding the collection and use of your information.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>7. Service Modifications</h2>
                        <p>
                            We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>8. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, Empowerly shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>9. Indemnification</h2>
                        <p>
                            You agree to indemnify and hold harmless Empowerly and its affiliates from any claims, damages, losses, liabilities, and expenses arising out of your use of the Service or violation of these Terms.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>10. Termination</h2>
                        <p>
                            We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including if you breach these Terms.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>11. Governing Law</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Empowerly operates, without regard to its conflict of law provisions.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>12. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last Updated" date.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>13. Contact Information</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <p>
                            Email: legal@empowerly.com<br />
                            Phone: +1 (555) 123-4567<br />
                            Address: 123 Business Street, Suite 100, City, State 12345
                        </p>
                    </section>

                    <div className="terms-footer">
                        <Link to="/" className="btn btn-primary">Back to Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
