import React, { useState, useEffect } from 'react';
import './SystemSettings.css';

const SystemSettings = () => {
    const [settings, setSettings] = useState({
        // Company Information
        companyName: 'Empowerly',
        companyEmail: 'admin@empowerly.com',
        companyPhone: '+1 (555) 123-4567',
        companyAddress: '123 Business Street, City, State 12345',

        // Leave Policies
        casualLeaveLimit: 12,
        sickLeaveLimit: 10,
        paidLeaveLimit: 15,
        leaveCarryForward: true,
        maxCarryForwardDays: 5,

        // Attendance Policies
        workingHoursPerDay: 8,
        lateArrivalThreshold: 15, // minutes
        earlyDepartureThreshold: 15, // minutes
        halfDayHours: 4,

        // Performance Review
        reviewCycleFrequency: 'quarterly', // monthly, quarterly, half-yearly, yearly
        enableSelfAssessment: true,
        enablePeerReview: false,

        // Payroll Settings
        payrollCurrency: 'INR',
        payrollCycle: 'monthly', // weekly, bi-weekly, monthly
        payrollProcessingDay: 1, // day of month

        // System Preferences
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24-hour',
        timezone: 'Asia/Kolkata',
        language: 'en',

        // Notifications
        emailNotifications: true,
        leaveApprovalNotifications: true,
        payrollNotifications: true,
        performanceReviewNotifications: true,

        // Security
        sessionTimeout: 30, // minutes
        passwordExpiryDays: 90,
        enforceStrongPassword: true,
        twoFactorAuth: false
    });

    const [activeSection, setActiveSection] = useState('company');
    const [saveMessage, setSaveMessage] = useState('');

    const handleInputChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        // In a real app, this would save to backend
        console.log('Saving settings:', settings);
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
    };

    const renderCompanySettings = () => (
        <div className="settings-section">
            <h3>Company Information</h3>
            <div className="settings-grid">
                <div className="setting-item">
                    <label>Company Name</label>
                    <input
                        type="text"
                        value={settings.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                    />
                </div>
                <div className="setting-item">
                    <label>Company Email</label>
                    <input
                        type="email"
                        value={settings.companyEmail}
                        onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                    />
                </div>
                <div className="setting-item">
                    <label>Company Phone</label>
                    <input
                        type="tel"
                        value={settings.companyPhone}
                        onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                    />
                </div>
                <div className="setting-item full-width">
                    <label>Company Address</label>
                    <textarea
                        value={settings.companyAddress}
                        onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                        rows="3"
                    />
                </div>
            </div>
        </div>
    );

    const renderLeavePolicies = () => (
        <div className="settings-section">
            <h3>Leave Policies</h3>
            <div className="settings-grid">
                <div className="setting-item">
                    <label>Casual Leave Limit (per year)</label>
                    <input
                        type="number"
                        value={settings.casualLeaveLimit}
                        onChange={(e) => handleInputChange('casualLeaveLimit', parseInt(e.target.value))}
                        min="0"
                    />
                </div>
                <div className="setting-item">
                    <label>Sick Leave Limit (per year)</label>
                    <input
                        type="number"
                        value={settings.sickLeaveLimit}
                        onChange={(e) => handleInputChange('sickLeaveLimit', parseInt(e.target.value))}
                        min="0"
                    />
                </div>
                <div className="setting-item">
                    <label>Paid Leave Limit (per year)</label>
                    <input
                        type="number"
                        value={settings.paidLeaveLimit}
                        onChange={(e) => handleInputChange('paidLeaveLimit', parseInt(e.target.value))}
                        min="0"
                    />
                </div>
                <div className="setting-item">
                    <label>Allow Leave Carry Forward</label>
                    <div className="toggle-switch">
                        <input
                            type="checkbox"
                            id="leaveCarryForward"
                            checked={settings.leaveCarryForward}
                            onChange={(e) => handleInputChange('leaveCarryForward', e.target.checked)}
                        />
                        <label htmlFor="leaveCarryForward" className="toggle-label"></label>
                    </div>
                </div>
                {settings.leaveCarryForward && (
                    <div className="setting-item">
                        <label>Max Carry Forward Days</label>
                        <input
                            type="number"
                            value={settings.maxCarryForwardDays}
                            onChange={(e) => handleInputChange('maxCarryForwardDays', parseInt(e.target.value))}
                            min="0"
                        />
                    </div>
                )}
            </div>
        </div>
    );

    const renderAttendancePolicies = () => (
        <div className="settings-section">
            <h3>Attendance Policies</h3>
            <div className="settings-grid">
                <div className="setting-item">
                    <label>Working Hours Per Day</label>
                    <input
                        type="number"
                        value={settings.workingHoursPerDay}
                        onChange={(e) => handleInputChange('workingHoursPerDay', parseInt(e.target.value))}
                        min="1"
                        max="24"
                    />
                </div>
                <div className="setting-item">
                    <label>Late Arrival Threshold (minutes)</label>
                    <input
                        type="number"
                        value={settings.lateArrivalThreshold}
                        onChange={(e) => handleInputChange('lateArrivalThreshold', parseInt(e.target.value))}
                        min="0"
                    />
                </div>
                <div className="setting-item">
                    <label>Early Departure Threshold (minutes)</label>
                    <input
                        type="number"
                        value={settings.earlyDepartureThreshold}
                        onChange={(e) => handleInputChange('earlyDepartureThreshold', parseInt(e.target.value))}
                        min="0"
                    />
                </div>
                <div className="setting-item">
                    <label>Half Day Hours</label>
                    <input
                        type="number"
                        value={settings.halfDayHours}
                        onChange={(e) => handleInputChange('halfDayHours', parseInt(e.target.value))}
                        min="1"
                    />
                </div>
            </div>
        </div>
    );

    const renderPerformanceSettings = () => (
        <div className="settings-section">
            <h3>Performance Review Settings</h3>
            <div className="settings-grid">
                <div className="setting-item">
                    <label>Review Cycle Frequency</label>
                    <select
                        value={settings.reviewCycleFrequency}
                        onChange={(e) => handleInputChange('reviewCycleFrequency', e.target.value)}
                    >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="half-yearly">Half-Yearly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
                <div className="setting-item">
                    <label>Enable Self Assessment</label>
                    <div className="toggle-switch">
                        <input
                            type="checkbox"
                            id="enableSelfAssessment"
                            checked={settings.enableSelfAssessment}
                            onChange={(e) => handleInputChange('enableSelfAssessment', e.target.checked)}
                        />
                        <label htmlFor="enableSelfAssessment" className="toggle-label"></label>
                    </div>
                </div>
                <div className="setting-item">
                    <label>Enable Peer Review</label>
                    <div className="toggle-switch">
                        <input
                            type="checkbox"
                            id="enablePeerReview"
                            checked={settings.enablePeerReview}
                            onChange={(e) => handleInputChange('enablePeerReview', e.target.checked)}
                        />
                        <label htmlFor="enablePeerReview" className="toggle-label"></label>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPayrollSettings = () => (
        <div className="settings-section">
            <h3>Payroll Settings</h3>
            <div className="settings-grid">
                <div className="setting-item">
                    <label>Currency</label>
                    <select
                        value={settings.payrollCurrency}
                        onChange={(e) => handleInputChange('payrollCurrency', e.target.value)}
                    >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                    </select>
                </div>
                <div className="setting-item">
                    <label>Payroll Cycle</label>
                    <select
                        value={settings.payrollCycle}
                        onChange={(e) => handleInputChange('payrollCycle', e.target.value)}
                    >
                        <option value="weekly">Weekly</option>
                        <option value="bi-weekly">Bi-Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                <div className="setting-item">
                    <label>Processing Day of Month</label>
                    <input
                        type="number"
                        value={settings.payrollProcessingDay}
                        onChange={(e) => handleInputChange('payrollProcessingDay', parseInt(e.target.value))}
                        min="1"
                        max="31"
                    />
                </div>
            </div>
        </div>
    );

    const renderSystemPreferences = () => (
        <div className="settings-section">
            <h3>System Preferences</h3>
            <div className="settings-grid">
                <div className="setting-item">
                    <label>Date Format</label>
                    <select
                        value={settings.dateFormat}
                        onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                    >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                </div>
                <div className="setting-item">
                    <label>Time Format</label>
                    <select
                        value={settings.timeFormat}
                        onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                    >
                        <option value="12-hour">12-hour</option>
                        <option value="24-hour">24-hour</option>
                    </select>
                </div>
                <div className="setting-item">
                    <label>Timezone</label>
                    <select
                        value={settings.timezone}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                    >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="America/New_York">America/New York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                        <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    </select>
                </div>
                <div className="setting-item">
                    <label>Language</label>
                    <select
                        value={settings.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                    >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderNotificationSettings = () => (
        <div className="settings-section">
            <h3>Notification Settings</h3>
            <div className="settings-grid">
                <div className="setting-item">
                    <label>Email Notifications</label>
                    <div className="toggle-switch">
                        <input
                            type="checkbox"
                            id="emailNotifications"
                            checked={settings.emailNotifications}
                            onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                        />
                        <label htmlFor="emailNotifications" className="toggle-label"></label>
                    </div>
                </div>
                <div className="setting-item">
                    <label>Leave Approval Notifications</label>
                    <div className="toggle-switch">
                        <input
                            type="checkbox"
                            id="leaveApprovalNotifications"
                            checked={settings.leaveApprovalNotifications}
                            onChange={(e) => handleInputChange('leaveApprovalNotifications', e.target.checked)}
                        />
                        <label htmlFor="leaveApprovalNotifications" className="toggle-label"></label>
                    </div>
                </div>
                <div className="setting-item">
                    <label>Payroll Notifications</label>
                    <div className="toggle-switch">
                        <input
                            type="checkbox"
                            id="payrollNotifications"
                            checked={settings.payrollNotifications}
                            onChange={(e) => handleInputChange('payrollNotifications', e.target.checked)}
                        />
                        <label htmlFor="payrollNotifications" className="toggle-label"></label>
                    </div>
                </div>
                <div className="setting-item">
                    <label>Performance Review Notifications</label>
                    <div className="toggle-switch">
                        <input
                            type="checkbox"
                            id="performanceReviewNotifications"
                            checked={settings.performanceReviewNotifications}
                            onChange={(e) => handleInputChange('performanceReviewNotifications', e.target.checked)}
                        />
                        <label htmlFor="performanceReviewNotifications" className="toggle-label"></label>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSecuritySettings = () => (
        <div className="settings-section">
            <h3>Security Settings</h3>
            <div className="settings-grid">
                <div className="setting-item">
                    <label>Session Timeout (minutes)</label>
                    <input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                        min="5"
                        max="120"
                    />
                </div>
                <div className="setting-item">
                    <label>Password Expiry (days)</label>
                    <input
                        type="number"
                        value={settings.passwordExpiryDays}
                        onChange={(e) => handleInputChange('passwordExpiryDays', parseInt(e.target.value))}
                        min="30"
                    />
                </div>
                <div className="setting-item">
                    <label>Enforce Strong Password</label>
                    <div className="toggle-switch">
                        <input
                            type="checkbox"
                            id="enforceStrongPassword"
                            checked={settings.enforceStrongPassword}
                            onChange={(e) => handleInputChange('enforceStrongPassword', e.target.checked)}
                        />
                        <label htmlFor="enforceStrongPassword" className="toggle-label"></label>
                    </div>
                </div>
                <div className="setting-item">
                    <label>Two-Factor Authentication</label>
                    <div className="toggle-switch">
                        <input
                            type="checkbox"
                            id="twoFactorAuth"
                            checked={settings.twoFactorAuth}
                            onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                        />
                        <label htmlFor="twoFactorAuth" className="toggle-label"></label>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="system-settings-container">
            <div className="settings-header">
                <h2>System Settings</h2>
                <p>Configure system-wide settings and policies</p>
            </div>

            <div className="settings-layout">
                <div className="settings-sidebar">
                    <button
                        className={`settings-nav-item ${activeSection === 'company' ? 'active' : ''}`}
                        onClick={() => setActiveSection('company')}
                    >
                        <span className="nav-icon">🏢</span>
                        Company Info
                    </button>
                    <button
                        className={`settings-nav-item ${activeSection === 'leave' ? 'active' : ''}`}
                        onClick={() => setActiveSection('leave')}
                    >
                        <span className="nav-icon">🌴</span>
                        Leave Policies
                    </button>
                    <button
                        className={`settings-nav-item ${activeSection === 'attendance' ? 'active' : ''}`}
                        onClick={() => setActiveSection('attendance')}
                    >
                        <span className="nav-icon">📅</span>
                        Attendance
                    </button>
                    <button
                        className={`settings-nav-item ${activeSection === 'performance' ? 'active' : ''}`}
                        onClick={() => setActiveSection('performance')}
                    >
                        <span className="nav-icon">📊</span>
                        Performance
                    </button>
                    <button
                        className={`settings-nav-item ${activeSection === 'payroll' ? 'active' : ''}`}
                        onClick={() => setActiveSection('payroll')}
                    >
                        <span className="nav-icon">💰</span>
                        Payroll
                    </button>
                    <button
                        className={`settings-nav-item ${activeSection === 'system' ? 'active' : ''}`}
                        onClick={() => setActiveSection('system')}
                    >
                        <span className="nav-icon">⚙️</span>
                        System Preferences
                    </button>
                    <button
                        className={`settings-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveSection('notifications')}
                    >
                        <span className="nav-icon">🔔</span>
                        Notifications
                    </button>
                    <button
                        className={`settings-nav-item ${activeSection === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveSection('security')}
                    >
                        <span className="nav-icon">🔒</span>
                        Security
                    </button>
                </div>

                <div className="settings-content">
                    {activeSection === 'company' && renderCompanySettings()}
                    {activeSection === 'leave' && renderLeavePolicies()}
                    {activeSection === 'attendance' && renderAttendancePolicies()}
                    {activeSection === 'performance' && renderPerformanceSettings()}
                    {activeSection === 'payroll' && renderPayrollSettings()}
                    {activeSection === 'system' && renderSystemPreferences()}
                    {activeSection === 'notifications' && renderNotificationSettings()}
                    {activeSection === 'security' && renderSecuritySettings()}

                    <div className="settings-actions">
                        <button className="btn-save" onClick={handleSave}>
                            💾 Save Settings
                        </button>
                        {saveMessage && <span className="save-message">{saveMessage}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
