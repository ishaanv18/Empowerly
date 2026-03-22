import React, { useState, useEffect } from 'react';
import { payrollAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import ConfirmDialog from '../ConfirmDialog';
import { motion } from 'framer-motion';
import './AdminPayrollApproval.css';

const AdminPayrollApproval = () => {
    const { showNotification } = useNotification();
    const [payrolls, setPayrolls] = useState([]);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [entries, setEntries] = useState([]);
    const [adminNotes, setAdminNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, payrollId: null });

    useEffect(() => {
        fetchPayrolls();
    }, []);

    const fetchPayrolls = async () => {
        try {
            const response = await payrollAPI.getAllPayrolls();
            setPayrolls(response.data);
        } catch (err) {
            console.error('Failed to load payrolls');
        }
    };

    const fetchEntries = async (payrollId) => {
        try {
            const response = await payrollAPI.getPayrollEntries(payrollId);
            setEntries(response.data);
        } catch (err) {
            console.error('Failed to load entries');
        }
    };

    const handleApprove = async () => {
        try {
            await payrollAPI.approvePayroll(selectedPayroll.id, { adminNotes });
            showNotification('Payroll approved successfully', 'success');
            setSelectedPayroll(null);
            fetchPayrolls();
        } catch (err) {
            showNotification('Failed to approve payroll', 'error');
        }
    };

    const handleReject = async () => {
        if (!rejectionReason) {
            showNotification('Please provide a rejection reason', 'warning');
            return;
        }
        try {
            await payrollAPI.rejectPayroll(selectedPayroll.id, { rejectionReason });
            showNotification('Payroll rejected', 'info');
            setSelectedPayroll(null);
            fetchPayrolls();
        } catch (err) {
            showNotification('Failed to reject payroll', 'error');
        }
    };

    const handleDelete = async (payrollId, event) => {
        event.stopPropagation(); // Prevent card click
        setConfirmDialog({ isOpen: true, payrollId });
    };

    const confirmDelete = async () => {
        try {
            await payrollAPI.deletePayroll(confirmDialog.payrollId);
            showNotification('Payroll deleted successfully', 'success');
            fetchPayrolls();
        } catch (err) {
            showNotification('Failed to delete payroll', 'error');
        } finally {
            setConfirmDialog({ isOpen: false, payrollId: null });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const getMonthName = (month) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month - 1];
    };

    const pendingPayrolls = payrolls.filter(p => p.status === 'PENDING_APPROVAL');

    return (
        <div className="admin-payroll-container">
            <h2>Payroll Approval</h2>

            <div className="pending-payrolls">
                <h3>Pending Approvals ({pendingPayrolls.length})</h3>
                {pendingPayrolls.map((payroll) => (
                    <motion.div
                        key={payroll.id}
                        className="approval-card"
                        whileHover={{ scale: 1.01 }}
                        onClick={() => {
                            setSelectedPayroll(payroll);
                            fetchEntries(payroll.id);
                        }}
                    >
                        <div className="approval-info">
                            <h4>{getMonthName(payroll.month)} {payroll.year}</h4>
                            <p>{payroll.totalEmployees} employees • {formatCurrency(payroll.totalAmount)}</p>
                        </div>
                        <button className="btn-review">Review</button>
                    </motion.div>
                ))}
            </div>

            {selectedPayroll && (
                <div className="modal-overlay" onClick={() => setSelectedPayroll(null)}>
                    <div className="approval-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Review Payroll - {getMonthName(selectedPayroll.month)} {selectedPayroll.year}</h3>
                            <button onClick={() => setSelectedPayroll(null)}>✕</button>
                        </div>

                        <div className="payroll-summary">
                            <div className="summary-item">
                                <span>Total Employees</span>
                                <span>{selectedPayroll.totalEmployees}</span>
                            </div>
                            <div className="summary-item">
                                <span>Total Amount</span>
                                <span>{formatCurrency(selectedPayroll.totalAmount)}</span>
                            </div>
                        </div>

                        <div className="entries-list">
                            <h4>Employee Entries</h4>
                            {entries.map((entry) => (
                                <div key={entry.id} className="entry-item">
                                    <span className="employee-name">{entry.employeeName}</span>
                                    <span className="net-salary">{formatCurrency(entry.netSalary)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="approval-form">
                            <div className="form-group">
                                <label>Admin Notes</label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes (optional)"
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Rejection Reason (if rejecting)</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Required if rejecting"
                                    rows="2"
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-reject" onClick={handleReject}>Reject</button>
                            <button className="btn-approve" onClick={handleApprove}>Approve</button>
                        </div>
                    </div>
                </div>
            )}

            {/* All Payrolls Section */}
            <div className="all-payrolls-section">
                <h3>All Payrolls</h3>
                <div className="payrolls-table">
                    {payrolls.map((payroll) => (
                        <motion.div
                            key={payroll.id}
                            className="payroll-row"
                            whileHover={{ scale: 1.005 }}
                        >
                            <div className="payroll-info">
                                <span className="payroll-period">{getMonthName(payroll.month)} {payroll.year}</span>
                                <span className={`status-badge status-${payroll.status.toLowerCase()}`}>
                                    {payroll.status}
                                </span>
                                <span className="payroll-amount">{formatCurrency(payroll.totalAmount)}</span>
                                <span className="payroll-employees">{payroll.totalEmployees} employees</span>
                            </div>
                            <button
                                className="btn-delete"
                                onClick={(e) => handleDelete(payroll.id, e)}
                                title="Delete Payroll"
                            >
                                🗑️ Delete
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Delete Payroll"
                message="Are you sure you want to delete this payroll? This will permanently delete all related entries and payslips."
                onConfirm={confirmDelete}
                onCancel={() => setConfirmDialog({ isOpen: false, payrollId: null })}
            />
        </div>
    );
};

export default AdminPayrollApproval;
