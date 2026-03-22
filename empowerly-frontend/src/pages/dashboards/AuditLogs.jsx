import React, { useState, useEffect } from 'react';
import { auditLogAPI } from '../../services/api';
import './AuditLogs.css';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(20);

    // Filters
    const [filters, setFilters] = useState({
        userId: '',
        action: '',
        entityType: '',
        status: '',
        search: '',
        startDate: '',
        endDate: ''
    });

    const [selectedLog, setSelectedLog] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [currentPage, filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                size: pageSize,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== '')
                )
            };

            const response = await auditLogAPI.getAllLogs(params);
            setLogs(response.data.content);
            setTotalPages(response.data.totalPages);
            setError(null);
        } catch (err) {
            setError('Failed to fetch audit logs');
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await auditLogAPI.getStats();
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(0); // Reset to first page when filters change
    };

    const resetFilters = () => {
        setFilters({
            userId: '',
            action: '',
            entityType: '',
            status: '',
            search: '',
            startDate: '',
            endDate: ''
        });
        setCurrentPage(0);
    };

    const getActionColor = (action) => {
        const colors = {
            'CREATE': '#10b981',
            'UPDATE': '#3b82f6',
            'DELETE': '#ef4444',
            'LOGIN': '#8b5cf6',
            'LOGOUT': '#6b7280',
            'APPROVE': '#10b981',
            'REJECT': '#ef4444',
            'REGISTER': '#06b6d4',
            'OTP_VERIFY': '#06b6d4'
        };
        return colors[action] || '#6b7280';
    };

    const getActionIcon = (action) => {
        const icons = {
            'CREATE': '➕',
            'UPDATE': '✏️',
            'DELETE': '🗑️',
            'LOGIN': '🔓',
            'LOGOUT': '🔒',
            'APPROVE': '✅',
            'REJECT': '❌',
            'REGISTER': '📝',
            'OTP_VERIFY': '🔐'
        };
        return icons[action] || '📋';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const viewDetails = (log) => {
        setSelectedLog(log);
        setShowDetails(true);
    };

    return (
        <div className="audit-logs-container">
            <div className="audit-logs-header">
                <h1>📋 Audit Logs</h1>
                <p>Track all system activities and user actions</p>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalLogs}</div>
                            <div className="stat-label">Total Logs</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⚡</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.recentActivity}</div>
                            <div className="stat-label">Last 24 Hours</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">❌</div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.failedActions}</div>
                            <div className="stat-label">Failed Actions</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters-section">
                <h3>🔍 Filters</h3>
                <div className="filters-grid">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search description..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="filter-input"
                    />

                    <select
                        name="action"
                        value={filters.action}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="">All Actions</option>
                        <option value="LOGIN">Login</option>
                        <option value="LOGOUT">Logout</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                        <option value="APPROVE">Approve</option>
                        <option value="REJECT">Reject</option>
                        <option value="REGISTER">Register</option>
                        <option value="OTP_VERIFY">OTP Verify</option>
                    </select>

                    <select
                        name="entityType"
                        value={filters.entityType}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="">All Entities</option>
                        <option value="USER">User</option>
                        <option value="ATTENDANCE">Attendance</option>
                        <option value="LEAVE">Leave</option>
                        <option value="PAYROLL">Payroll</option>
                        <option value="REVIEW">Review</option>
                        <option value="MEETING">Meeting</option>
                    </select>

                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="">All Status</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILURE">Failure</option>
                    </select>

                    <input
                        type="datetime-local"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="filter-input"
                        placeholder="Start Date"
                    />

                    <input
                        type="datetime-local"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="filter-input"
                        placeholder="End Date"
                    />

                    <button onClick={resetFilters} className="reset-button">
                        🔄 Reset Filters
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="logs-section">
                {loading ? (
                    <div className="loading">Loading audit logs...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : logs.length === 0 ? (
                    <div className="no-data">No audit logs found</div>
                ) : (
                    <>
                        <div className="logs-table-container">
                            <table className="logs-table">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Entity</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="timestamp-cell">
                                                {formatDate(log.timestamp)}
                                            </td>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-name">{log.userName}</div>
                                                    <div className="user-role">{log.userRole}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className="action-badge"
                                                    style={{ backgroundColor: getActionColor(log.action) }}
                                                >
                                                    {getActionIcon(log.action)} {log.action}
                                                </span>
                                            </td>
                                            <td className="entity-cell">{log.entityType}</td>
                                            <td className="description-cell">{log.description}</td>
                                            <td>
                                                <span className={`status-badge ${log.status.toLowerCase()}`}>
                                                    {log.status === 'SUCCESS' ? '✓' : '✗'} {log.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => viewDetails(log)}
                                                    className="view-details-btn"
                                                >
                                                    👁️ View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="pagination">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                                className="pagination-btn"
                            >
                                ← Previous
                            </button>
                            <span className="pagination-info">
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={currentPage >= totalPages - 1}
                                className="pagination-btn"
                            >
                                Next →
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Details Modal */}
            {showDetails && selectedLog && (
                <div className="modal-overlay" onClick={() => setShowDetails(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Audit Log Details</h2>
                            <button onClick={() => setShowDetails(false)} className="close-btn">✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <strong>Timestamp:</strong>
                                <span>{formatDate(selectedLog.timestamp)}</span>
                            </div>
                            <div className="detail-row">
                                <strong>User:</strong>
                                <span>{selectedLog.userName} ({selectedLog.userRole})</span>
                            </div>
                            <div className="detail-row">
                                <strong>Action:</strong>
                                <span className="action-badge" style={{ backgroundColor: getActionColor(selectedLog.action) }}>
                                    {getActionIcon(selectedLog.action)} {selectedLog.action}
                                </span>
                            </div>
                            <div className="detail-row">
                                <strong>Entity Type:</strong>
                                <span>{selectedLog.entityType}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Entity ID:</strong>
                                <span>{selectedLog.entityId || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Description:</strong>
                                <span>{selectedLog.description}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Status:</strong>
                                <span className={`status-badge ${selectedLog.status.toLowerCase()}`}>
                                    {selectedLog.status}
                                </span>
                            </div>
                            {selectedLog.ipAddress && (
                                <div className="detail-row">
                                    <strong>IP Address:</strong>
                                    <span>{selectedLog.ipAddress}</span>
                                </div>
                            )}
                            {selectedLog.userAgent && (
                                <div className="detail-row">
                                    <strong>User Agent:</strong>
                                    <span className="user-agent">{selectedLog.userAgent}</span>
                                </div>
                            )}
                            {selectedLog.errorMessage && (
                                <div className="detail-row error-message">
                                    <strong>Error:</strong>
                                    <span>{selectedLog.errorMessage}</span>
                                </div>
                            )}
                            {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                                <div className="detail-row">
                                    <strong>Additional Details:</strong>
                                    <pre className="details-json">
                                        {JSON.stringify(selectedLog.details, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
