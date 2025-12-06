import React, { useState, useEffect } from 'react';
import { payrollAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { motion } from 'framer-motion';
import './HRPayrollDashboard.css';

const HRPayrollDashboard = () => {
    const { showNotification } = useNotification();
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [payrollEntries, setPayrollEntries] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [newPayroll, setNewPayroll] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), hrNotes: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchPayrolls();
    }, []);

    const fetchPayrolls = async () => {
        try {
            const response = await payrollAPI.getAllPayrolls();
            setPayrolls(response.data);
        } catch (err) {
            console.error('Failed to load payrolls', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePayroll = async () => {
        try {
            await payrollAPI.createPayroll(newPayroll);
            showNotification('Payroll created successfully', 'success');
            setShowCreateModal(false);
            fetchPayrolls();
        } catch (err) {
            showNotification('Failed to create payroll', 'error');
        }
    };

    const handleGenerateEntries = async (payrollId) => {
        try {
            await payrollAPI.generateEntries(payrollId);
            showNotification('Payroll entries generated successfully', 'success');
            fetchPayrolls();
        } catch (err) {
            showNotification('Failed to generate entries', 'error');
        }
    };

    const handleSubmit = async (payrollId) => {
        try {
            await payrollAPI.submitForApproval(payrollId);
            showNotification('Payroll submitted for approval', 'success');
            fetchPayrolls();
        } catch (err) {
            showNotification('Failed to submit payroll', 'error');
        }
    };

    const handleViewDetails = async (payroll) => {
        setSelectedPayroll(payroll);
        setSelectedEntry(null);
        setShowDetailsModal(true);
        // Fetch payroll entries
        try {
            const response = await payrollAPI.getPayrollEntries(payroll.id);
            setPayrollEntries(response.data);
        } catch (err) {
            console.error('Failed to load payroll entries', err);
            showNotification('Failed to load payroll entries', 'error');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            DRAFT: { class: 'badge-draft', text: 'Draft' },
            PENDING_APPROVAL: { class: 'badge-pending', text: 'Pending' },
            APPROVED: { class: 'badge-approved', text: 'Approved' },
            REJECTED: { class: 'badge-rejected', text: 'Rejected' }
        };
        const badge = badges[status] || badges.DRAFT;
        return <span className={`badge ${badge.class}`}>{badge.text}</span>;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const getMonthName = (month) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month - 1];
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="hr-payroll-container">
            <div className="payroll-header">
                <div>
                    <h2>Payroll Management</h2>
                    <p>Create and manage monthly payrolls</p>
                </div>
                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                    Create New Payroll
                </button>
            </div>

            <div className="payrolls-list">
                {payrolls.map((payroll) => (
                    <motion.div key={payroll.id} className="payroll-card" whileHover={{ scale: 1.01 }}>
                        <div className="payroll-info">
                            <div className="payroll-title">
                                <h3>{getMonthName(payroll.month)} {payroll.year}</h3>
                                {getStatusBadge(payroll.status)}
                            </div>
                            <div className="payroll-stats">
                                <div className="stat">
                                    <span className="label">Employees</span>
                                    <span className="value">{payroll.totalEmployees}</span>
                                </div>
                                <div className="stat">
                                    <span className="label">Total Amount</span>
                                    <span className="value">{formatCurrency(payroll.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="payroll-actions">
                            {payroll.status === 'DRAFT' && (
                                <>
                                    <button className="btn-secondary" onClick={() => handleGenerateEntries(payroll.id)}>
                                        Generate Entries
                                    </button>
                                    <button className="btn-primary" onClick={() => handleSubmit(payroll.id)}>
                                        Submit for Approval
                                    </button>
                                </>
                            )}
                            {payroll.status === 'REJECTED' && (
                                <button className="btn-primary" onClick={() => handleSubmit(payroll.id)}>
                                    Resubmit
                                </button>
                            )}
                            <button className="btn-view" onClick={() => handleViewDetails(payroll)}>
                                View Details
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Create New Payroll</h3>
                        <div className="form-group">
                            <label>Month</label>
                            <select value={newPayroll.month} onChange={(e) => setNewPayroll({ ...newPayroll, month: parseInt(e.target.value) })}>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Year</label>
                            <input
                                type="number"
                                value={newPayroll.year}
                                onChange={(e) => setNewPayroll({ ...newPayroll, year: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Notes</label>
                            <textarea
                                value={newPayroll.hrNotes}
                                onChange={(e) => setNewPayroll({ ...newPayroll, hrNotes: e.target.value })}
                                rows="3"
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleCreatePayroll}>Create</button>
                        </div>
                    </div>
                </div>
            )}

            {showDetailsModal && selectedPayroll && (
                <div className="modal-overlay" onClick={() => { setShowDetailsModal(false); setSelectedEntry(null); }}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Payroll Details - {getMonthName(selectedPayroll.month)} {selectedPayroll.year}</h3>
                            <button className="btn-close" onClick={() => { setShowDetailsModal(false); setSelectedEntry(null); }}>✕</button>
                        </div>
                        <div className="payroll-detail-content">
                            <div className="detail-row">
                                <span className="label">Status:</span>
                                <span>{getStatusBadge(selectedPayroll.status)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Employees:</span>
                                <span className="value">{selectedPayroll.totalEmployees}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Total Amount:</span>
                                <span className="value">{formatCurrency(selectedPayroll.totalAmount)}</span>
                            </div>
                            {selectedPayroll.hrNotes && (
                                <div className="detail-row">
                                    <span className="label">HR Notes:</span>
                                    <span className="value">{selectedPayroll.hrNotes}</span>
                                </div>
                            )}
                            {selectedPayroll.adminNotes && (
                                <div className="detail-row">
                                    <span className="label">Admin Notes:</span>
                                    <span className="value">{selectedPayroll.adminNotes}</span>
                                </div>
                            )}

                            {/* Employee Entries List */}
                            <div className="entries-section">
                                <h4>Employee Payroll Entries</h4>
                                <div className="entries-list">
                                    {payrollEntries.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className={`entry-card ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedEntry(entry)}
                                        >
                                            <div className="entry-info">
                                                <span className="employee-name">{entry.employeeName}</span>
                                                <span className="net-salary">{formatCurrency(entry.netSalary)}</span>
                                            </div>
                                            <span className="view-arrow">→</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Selected Entry Details */}
                            {selectedEntry && (
                                <div className="payslip-details">
                                    <h4>Payslip Details - {selectedEntry.employeeName}</h4>

                                    <div className="payslip-section">
                                        <h5>Earnings</h5>
                                        <div className="payslip-row">
                                            <span>Basic Salary</span>
                                            <span>{formatCurrency(selectedEntry.basicSalary)}</span>
                                        </div>
                                        {Object.entries(selectedEntry.allowances || {}).map(([key, value]) => (
                                            <div key={key} className="payslip-row">
                                                <span>{key}</span>
                                                <span>{formatCurrency(value)}</span>
                                            </div>
                                        ))}
                                        <div className="payslip-row total">
                                            <span>Gross Salary</span>
                                            <span>{formatCurrency(selectedEntry.grossSalary)}</span>
                                        </div>
                                    </div>

                                    <div className="payslip-section">
                                        <h5>Deductions</h5>
                                        {Object.entries(selectedEntry.deductions || {}).map(([key, value]) => (
                                            <div key={key} className="payslip-row">
                                                <span>{key}</span>
                                                <span className="deduction">- {formatCurrency(value)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="payslip-section">
                                        <h5>Attendance</h5>
                                        <div className="payslip-row">
                                            <span>Working Days</span>
                                            <span>{selectedEntry.workingDays}</span>
                                        </div>
                                        <div className="payslip-row">
                                            <span>Present Days</span>
                                            <span>{selectedEntry.presentDays}</span>
                                        </div>
                                        <div className="payslip-row">
                                            <span>Paid Leaves</span>
                                            <span>{selectedEntry.paidLeaves}</span>
                                        </div>
                                        <div className="payslip-row">
                                            <span>Unpaid Leaves</span>
                                            <span>{selectedEntry.unpaidLeaves}</span>
                                        </div>
                                    </div>

                                    <div className="payslip-net">
                                        <span>Net Salary</span>
                                        <span className="net-amount">{formatCurrency(selectedEntry.netSalary)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => { setShowDetailsModal(false); setSelectedEntry(null); }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HRPayrollDashboard;
