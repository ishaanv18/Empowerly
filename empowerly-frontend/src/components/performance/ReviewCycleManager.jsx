import React, { useState, useEffect } from 'react';
import { performanceReviewAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './ReviewCycleManager.css';

const ReviewCycleManager = () => {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [cycles, setCycles] = useState([]);
    const [employees, setEmployees] = useState([]);

    // Modal visibility
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [showExtendConfirm, setShowExtendConfirm] = useState(false);
    const [showReopenModal, setShowReopenModal] = useState(false);

    // Selected cycle references
    const [cycleToDelete, setCycleToDelete] = useState(null);
    const [cycleToClose, setCycleToClose] = useState(null);
    const [cycleToExtend, setCycleToExtend] = useState(null);
    const [cycleToReopen, setCycleToReopen] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        targetScope: 'ALL',
        targetEmployeeIds: [],
    });
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [reopenEndDate, setReopenEndDate] = useState('');

    useEffect(() => {
        fetchCycles();
        fetchEmployees();
    }, []);

    const fetchCycles = async () => {
        try {
            const response = await performanceReviewAPI.getAllCycles();
            setCycles(response.data);
        } catch (error) {
            console.error('Error fetching cycles:', error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await performanceReviewAPI.getEmployees();
            setEmployees(response.data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const formatLocalDateTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().slice(0, -1);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                startDate: formatLocalDateTime(formData.startDate),
                endDate: formatLocalDateTime(formData.endDate),
                targetScope: formData.targetScope,
                targetEmployeeIds: formData.targetScope === 'SPECIFIC' ? formData.targetEmployeeIds : [],
            };

            if (formData.targetScope === 'SPECIFIC' && formData.targetEmployeeIds.length === 0) {
                showNotification('Please select at least one employee.', 'error');
                return;
            }

            await performanceReviewAPI.createCycle(payload);
            const scopeMsg = formData.targetScope === 'ALL'
                ? 'Review cycle created for all employees!'
                : `Review cycle created for ${formData.targetEmployeeIds.length} employee(s)!`;
            showNotification(scopeMsg, 'success');
            setShowCreateModal(false);
            setFormData({ name: '', startDate: '', endDate: '', targetScope: 'ALL', targetEmployeeIds: [] });
            fetchCycles();
        } catch (error) {
            console.error('Error creating cycle:', error);
            showNotification('Failed to create cycle', 'error');
        }
    };

    const toggleEmployeeSelection = (id) => {
        setFormData(prev => ({
            ...prev,
            targetEmployeeIds: prev.targetEmployeeIds.includes(id)
                ? prev.targetEmployeeIds.filter(eid => eid !== id)
                : [...prev.targetEmployeeIds, id],
        }));
    };

    const handlePublish = async (cycleId) => {
        try {
            await performanceReviewAPI.publishCycle(cycleId);
            showNotification('Cycle published! Employees can now submit reviews.', 'success');
            fetchCycles();
        } catch (error) {
            console.error('Error publishing cycle:', error);
            showNotification('Failed to publish cycle', 'error');
        }
    };

    const handleClose = async () => {
        try {
            await performanceReviewAPI.closeCycle(cycleToClose);
            showNotification('Cycle closed successfully', 'success');
            setShowCloseConfirm(false);
            setCycleToClose(null);
            fetchCycles();
        } catch (error) {
            console.error('Error closing cycle:', error);
            showNotification('Failed to close cycle', 'error');
        }
    };

    const handleReopen = async () => {
        if (!reopenEndDate) {
            showNotification('Please set a new deadline.', 'error');
            return;
        }
        try {
            await performanceReviewAPI.reopenCycle(cycleToReopen, formatLocalDateTime(reopenEndDate));
            showNotification('Cycle reopened! Employees can submit reviews again.', 'success');
            setShowReopenModal(false);
            setCycleToReopen(null);
            setReopenEndDate('');
            fetchCycles();
        } catch (error) {
            console.error('Error reopening cycle:', error);
            showNotification('Failed to reopen cycle', 'error');
        }
    };

    const handleExtendDeadline = async () => {
        try {
            await performanceReviewAPI.extendDeadline(cycleToExtend, 30);
            showNotification('Deadline extended by 30 minutes!', 'success');
            setShowExtendConfirm(false);
            setCycleToExtend(null);
            fetchCycles();
        } catch (error) {
            console.error('Error extending deadline:', error);
            showNotification('Failed to extend deadline', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await performanceReviewAPI.deleteCycle(cycleToDelete);
            showNotification('Cycle deleted successfully', 'success');
            setShowDeleteConfirm(false);
            setCycleToDelete(null);
            fetchCycles();
        } catch (error) {
            console.error('Error deleting cycle:', error);
            showNotification('Failed to delete cycle', 'error');
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        emp.email?.toLowerCase().includes(employeeSearch.toLowerCase())
    );

    return (
        <div className="cycle-manager-container">
            <div className="manager-header">
                <h1>Review Cycle Management</h1>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                    + Create New Cycle
                </button>
            </div>

            <div className="cycles-grid">
                {cycles.map(cycle => (
                    <div key={cycle.id} className="cycle-card">
                        <div className="cycle-header">
                            <h3>{cycle.name}</h3>
                            <span className={`status-badge status-${cycle.status.toLowerCase()}`}>
                                {cycle.status}
                            </span>
                        </div>

                        {cycle.targetScope && (
                            <div className="cycle-scope-badge">
                                {cycle.targetScope === 'SPECIFIC'
                                    ? `👥 Specific (${cycle.totalReviews} employees)`
                                    : '🌐 All Employees'}
                            </div>
                        )}

                        <div className="cycle-details">
                            <div className="detail-item">
                                <span className="label">Start Date:</span>
                                <span>{new Date(cycle.startDate).toLocaleString()}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">End Date:</span>
                                <span>{new Date(cycle.endDate).toLocaleString()}</span>
                            </div>
                            <div className="detail-item">
                                <span className="label">Created By:</span>
                                <span>{cycle.createdByName}</span>
                            </div>
                        </div>

                        <div className="cycle-stats">
                            <div className="stat">
                                <div className="stat-value">{cycle.totalReviews}</div>
                                <div className="stat-label">Total</div>
                            </div>
                            <div className="stat">
                                <div className="stat-value">{cycle.submittedReviews}</div>
                                <div className="stat-label">Submitted</div>
                            </div>
                            <div className="stat">
                                <div className="stat-value">{cycle.approvedReviews}</div>
                                <div className="stat-label">Approved</div>
                            </div>
                        </div>

                        <div className="cycle-actions">
                            {cycle.status === 'DRAFT' && (
                                <>
                                    <button onClick={() => handlePublish(cycle.id)} className="btn btn-success">
                                        Publish
                                    </button>
                                    <button
                                        onClick={() => { setCycleToDelete(cycle.id); setShowDeleteConfirm(true); }}
                                        className="btn btn-danger"
                                    >
                                        🗑️ Delete
                                    </button>
                                </>
                            )}
                            {cycle.status === 'ACTIVE' && (
                                <>
                                    <button
                                        onClick={() => { setCycleToExtend(cycle.id); setShowExtendConfirm(true); }}
                                        className="btn btn-warning"
                                        title="Extend deadline by 30 minutes"
                                    >
                                        ⏰ Extend +30min
                                    </button>
                                    <button
                                        onClick={() => { setCycleToClose(cycle.id); setShowCloseConfirm(true); }}
                                        className="btn btn-danger"
                                    >
                                        Close Cycle
                                    </button>
                                </>
                            )}
                            {cycle.status === 'CLOSED' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setCycleToReopen(cycle.id);
                                            setShowReopenModal(true);
                                        }}
                                        className="btn btn-success"
                                    >
                                        🔄 Reopen Cycle
                                    </button>
                                    <button
                                        onClick={() => { setCycleToDelete(cycle.id); setShowDeleteConfirm(true); }}
                                        className="btn btn-danger"
                                    >
                                        🗑️ Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Create Modal ── */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <h2>Create New Review Cycle</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Cycle Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Q1 2025 Performance Review"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Date *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Scope selector */}
                            <div className="form-group">
                                <label>Who is this review for? *</label>
                                <div className="scope-toggle">
                                    <label className={`scope-option ${formData.targetScope === 'ALL' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="targetScope"
                                            value="ALL"
                                            checked={formData.targetScope === 'ALL'}
                                            onChange={() => setFormData({ ...formData, targetScope: 'ALL', targetEmployeeIds: [] })}
                                        />
                                        🌐 All Employees
                                    </label>
                                    <label className={`scope-option ${formData.targetScope === 'SPECIFIC' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="targetScope"
                                            value="SPECIFIC"
                                            checked={formData.targetScope === 'SPECIFIC'}
                                            onChange={() => setFormData({ ...formData, targetScope: 'SPECIFIC' })}
                                        />
                                        👥 Specific Employees
                                    </label>
                                </div>
                            </div>

                            {/* Employee picker — shown only when SPECIFIC */}
                            {formData.targetScope === 'SPECIFIC' && (
                                <div className="form-group">
                                    <label>
                                        Select Employees *{' '}
                                        <span className="selected-count">
                                            ({formData.targetEmployeeIds.length} selected)
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        className="employee-search"
                                        placeholder="Search by name or email..."
                                        value={employeeSearch}
                                        onChange={(e) => setEmployeeSearch(e.target.value)}
                                    />
                                    <div className="employee-list">
                                        {filteredEmployees.map(emp => (
                                            <label
                                                key={emp.id}
                                                className={`employee-item ${formData.targetEmployeeIds.includes(emp.id) ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.targetEmployeeIds.includes(emp.id)}
                                                    onChange={() => toggleEmployeeSelection(emp.id)}
                                                />
                                                <div className="employee-info">
                                                    <span className="employee-name">{emp.name}</span>
                                                    <span className="employee-email">{emp.email}</span>
                                                </div>
                                                <span className="employee-role">{emp.role}</span>
                                            </label>
                                        ))}
                                        {filteredEmployees.length === 0 && (
                                            <p className="no-employees">No employees found</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Cycle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Reopen Modal ── */}
            {showReopenModal && (
                <div className="modal-overlay" onClick={() => setShowReopenModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>🔄 Reopen Review Cycle</h3>
                        <p>Set a new deadline for employees to submit their reviews.</p>
                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label>New Deadline *</label>
                            <input
                                type="datetime-local"
                                value={reopenEndDate}
                                onChange={(e) => setReopenEndDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                onClick={() => { setShowReopenModal(false); setReopenEndDate(''); }}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button onClick={handleReopen} className="btn btn-success">
                                Reopen Cycle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm ── */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ color: '#eb3349', marginTop: 0 }}>⚠️ Delete Review Cycle?</h3>
                        <p>This will permanently delete this cycle and all associated reviews. This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleDelete} className="btn btn-danger">Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Close Confirm ── */}
            {showCloseConfirm && (
                <div className="modal-overlay" onClick={() => setShowCloseConfirm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ color: '#eb3349', marginTop: 0 }}>⚠️ Close Review Cycle?</h3>
                        <p>No more reviews can be submitted after closing. You can reopen it later.</p>
                        <div className="modal-actions">
                            <button onClick={() => setShowCloseConfirm(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleClose} className="btn btn-danger">Yes, Close Cycle</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Extend Confirm ── */}
            {showExtendConfirm && (
                <div className="modal-overlay" onClick={() => setShowExtendConfirm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>⏰ Extend Deadline?</h3>
                        <p>Extend deadline by 30 minutes? This allows users to submit reviews for an additional 30 minutes.</p>
                        <div className="modal-actions">
                            <button onClick={() => setShowExtendConfirm(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleExtendDeadline} className="btn btn-warning">Yes, Extend +30min</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewCycleManager;
