import React, { useState, useEffect } from 'react';
import { securityAPI } from '../../services/api';
import './SecurityDashboard.css';

const SecurityDashboard = () => {
    const [activeTab, setActiveTab] = useState('sessions');
    const [sessions, setSessions] = useState([]);
    const [loginAttempts, setLoginAttempts] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const statsResponse = await securityAPI.getSecurityStats();
            setStats(statsResponse.data);

            if (activeTab === 'sessions') {
                const response = await securityAPI.getAllSessions();
                setSessions(response.data);
            } else if (activeTab === 'logins') {
                const response = await securityAPI.getLoginAttempts();
                setLoginAttempts(response.data);
            } else if (activeTab === 'alerts') {
                const response = await securityAPI.getAllAlerts();
                setAlerts(response.data);
            }
        } catch (error) {
            console.error('Error fetching security data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewAlert = async (alertId) => {
        try {
            await securityAPI.reviewAlert(alertId);
            fetchData();
        } catch (error) {
            console.error('Error reviewing alert:', error);
        }
    };

    const handleResolveAlert = async (alertId) => {
        const resolution = prompt('Enter resolution notes:');
        if (resolution) {
            try {
                await securityAPI.resolveAlert(alertId, resolution);
                fetchData();
            } catch (error) {
                console.error('Error resolving alert:', error);
            }
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'CRITICAL': return '#ef4444';
            case 'WARNING': return '#f59e0b';
            case 'INFO': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            NEW: '#ef4444',
            REVIEWED: '#f59e0b',
            RESOLVED: '#10b981'
        };
        return <span className="status-badge" style={{ background: colors[status] }}>{status}</span>;
    };

    const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);

    return (
        <div className="security-dashboard">
            <div className="dashboard-header">
                <h2>🔒 Security & Monitoring</h2>
                <p>Track sessions, monitor login patterns, and manage security alerts</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalSessions || 0}</div>
                        <div className="stat-label">Total Sessions</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🔑</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.totalLogins || 0}</div>
                        <div className="stat-label">Login Attempts</div>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.unusualLogins || 0}</div>
                        <div className="stat-label">Unusual Logins</div>
                    </div>
                </div>
                <div className="stat-card critical">
                    <div className="stat-icon">🚨</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.criticalAlerts || 0}</div>
                        <div className="stat-label">Critical Alerts</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sessions')}
                >
                    📝 Session Records
                </button>
                <button
                    className={`tab ${activeTab === 'logins' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logins')}
                >
                    🔐 Login Patterns
                </button>
                <button
                    className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('alerts')}
                >
                    🚨 Security Alerts
                </button>
            </div>

            {/* Content */}
            <div className="tab-content">
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <>
                        {/* Sessions Tab */}
                        {activeTab === 'sessions' && (
                            <div className="sessions-list">
                                <h3>Recent Session Activity</h3>
                                {sessions.length === 0 ? (
                                    <div className="empty-state">No session records found</div>
                                ) : (
                                    <div className="table-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Timestamp</th>
                                                    <th>User</th>
                                                    <th>Action</th>
                                                    <th>Type</th>
                                                    <th>IP Address</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sessions.slice(0, 50).map((session) => (
                                                    <tr key={session.id}>
                                                        <td>{new Date(session.timestamp).toLocaleString()}</td>
                                                        <td>
                                                            <div className="user-cell">
                                                                <strong>{session.userName}</strong>
                                                                <span className="role-badge">{session.userRole}</span>
                                                            </div>
                                                        </td>
                                                        <td><span className="action-badge">{session.action}</span></td>
                                                        <td>{session.actionType || 'N/A'}</td>
                                                        <td className="ip-address">{session.ipAddress || 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Login Patterns Tab */}
                        {activeTab === 'logins' && (
                            <div className="logins-list">
                                <h3>Login Attempt History</h3>
                                {loginAttempts.length === 0 ? (
                                    <div className="empty-state">No login attempts found</div>
                                ) : (
                                    <div className="table-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Time</th>
                                                    <th>Email</th>
                                                    <th>Status</th>
                                                    <th>IP Address</th>
                                                    <th>Unusual</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loginAttempts.slice(0, 50).map((attempt) => (
                                                    <tr key={attempt.id} className={attempt.isUnusual ? 'unusual-row' : ''}>
                                                        <td>{new Date(attempt.loginTime).toLocaleString()}</td>
                                                        <td>{attempt.email}</td>
                                                        <td>
                                                            <span className={`status-badge ${attempt.success ? 'success' : 'failure'}`}>
                                                                {attempt.success ? '✓ Success' : '✗ Failed'}
                                                            </span>
                                                        </td>
                                                        <td className="ip-address">{attempt.ipAddress || 'N/A'}</td>
                                                        <td>
                                                            {attempt.isUnusual && (
                                                                <span className="unusual-badge" title={attempt.unusualReason}>
                                                                    ⚠️ Unusual
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Alerts Tab */}
                        {activeTab === 'alerts' && (
                            <div className="alerts-list">
                                <div className="alerts-header">
                                    <h3>Security Alerts</h3>
                                    <div className="filter-buttons">
                                        <button
                                            className={filter === 'all' ? 'active' : ''}
                                            onClick={() => setFilter('all')}
                                        >
                                            All
                                        </button>
                                        <button
                                            className={filter === 'NEW' ? 'active' : ''}
                                            onClick={() => setFilter('NEW')}
                                        >
                                            New
                                        </button>
                                        <button
                                            className={filter === 'REVIEWED' ? 'active' : ''}
                                            onClick={() => setFilter('REVIEWED')}
                                        >
                                            Reviewed
                                        </button>
                                        <button
                                            className={filter === 'RESOLVED' ? 'active' : ''}
                                            onClick={() => setFilter('RESOLVED')}
                                        >
                                            Resolved
                                        </button>
                                    </div>
                                </div>
                                {filteredAlerts.length === 0 ? (
                                    <div className="empty-state">No alerts found</div>
                                ) : (
                                    <div className="alerts-grid">
                                        {filteredAlerts.map((alert) => (
                                            <div key={alert.id} className="alert-card" style={{ borderLeftColor: getSeverityColor(alert.severity) }}>
                                                <div className="alert-header">
                                                    <div className="alert-title">
                                                        <span className="severity-badge" style={{ background: getSeverityColor(alert.severity) }}>
                                                            {alert.severity}
                                                        </span>
                                                        <span className="alert-type">{alert.alertType}</span>
                                                    </div>
                                                    {getStatusBadge(alert.status)}
                                                </div>
                                                <div className="alert-body">
                                                    <p className="alert-description">{alert.description}</p>
                                                    <div className="alert-meta">
                                                        <span>User: {alert.userName || 'N/A'}</span>
                                                        <span>Detected: {new Date(alert.detectedAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                {alert.status === 'NEW' && (
                                                    <div className="alert-actions">
                                                        <button onClick={() => handleReviewAlert(alert.id)} className="btn-review">
                                                            Review
                                                        </button>
                                                        <button onClick={() => handleResolveAlert(alert.id)} className="btn-resolve">
                                                            Resolve
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SecurityDashboard;
