import React, { useState, useEffect } from 'react';
import { payrollAPI } from '../../services/api';
import { motion } from 'framer-motion';
import './EmployeePayslips.css';

const EmployeePayslips = () => {
    const [payslips, setPayslips] = useState([]);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPayslips();
    }, []);

    const fetchPayslips = async () => {
        try {
            setLoading(true);
            const response = await payrollAPI.getMyPayslips();
            setPayslips(response.data);
        } catch (err) {
            setError('Failed to load payslips');
        } finally {
            setLoading(false);
        }
    };

    const getMonthName = (month) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month - 1];
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    if (loading) return <div className="loading">Loading payslips...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="payslips-container">
            <div className="payslips-header">
                <h2>My Payslips</h2>
                <p>View and download your salary slips</p>
            </div>

            {payslips.length === 0 ? (
                <div className="no-payslips">
                    <p>No payslips available yet</p>
                </div>
            ) : (
                <div className="payslips-grid">
                    {payslips.map((payslip) => (
                        <motion.div
                            key={payslip.id}
                            className="payslip-card"
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setSelectedPayslip(payslip)}
                        >
                            <div className="payslip-period">
                                <span className="month">{getMonthName(payslip.month)}</span>
                                <span className="year">{payslip.year}</span>
                            </div>
                            <div className="payslip-amount">
                                <span className="label">Net Salary</span>
                                <span className="value">{formatCurrency(payslip.netSalary)}</span>
                            </div>
                            <button className="btn-view">View Details</button>
                        </motion.div>
                    ))}
                </div>
            )}

            {selectedPayslip && (
                <div className="modal-overlay" onClick={() => setSelectedPayslip(null)}>
                    <motion.div
                        className="payslip-modal"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>Payslip - {getMonthName(selectedPayslip.month)} {selectedPayslip.year}</h3>
                            <button onClick={() => setSelectedPayslip(null)}>✕</button>
                        </div>

                        <div className="payslip-details">
                            <div className="detail-section">
                                <h4>Earnings</h4>
                                <div className="detail-row">
                                    <span>Basic Salary</span>
                                    <span>{formatCurrency(selectedPayslip.basicSalary)}</span>
                                </div>
                                {Object.entries(selectedPayslip.allowances || {}).map(([key, value]) => (
                                    <div key={key} className="detail-row">
                                        <span>{key}</span>
                                        <span>{formatCurrency(value)}</span>
                                    </div>
                                ))}
                                <div className="detail-row total">
                                    <span>Gross Salary</span>
                                    <span>{formatCurrency(selectedPayslip.grossSalary)}</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Deductions</h4>
                                {Object.entries(selectedPayslip.deductions || {}).map(([key, value]) => (
                                    <div key={key} className="detail-row">
                                        <span>{key}</span>
                                        <span>- {formatCurrency(value)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="detail-section">
                                <h4>Attendance</h4>
                                <div className="detail-row">
                                    <span>Working Days</span>
                                    <span>{selectedPayslip.workingDays}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Present Days</span>
                                    <span>{selectedPayslip.presentDays}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Paid Leaves</span>
                                    <span>{selectedPayslip.paidLeaves}</span>
                                </div>
                                {selectedPayslip.unpaidLeaves > 0 && (
                                    <div className="detail-row">
                                        <span>Unpaid Leaves</span>
                                        <span>{selectedPayslip.unpaidLeaves}</span>
                                    </div>
                                )}
                            </div>

                            <div className="net-salary">
                                <span>Net Salary</span>
                                <span>{formatCurrency(selectedPayslip.netSalary)}</span>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-download" onClick={() => window.print()}>Download PDF</button>
                            <button className="btn-print" onClick={() => window.print()}>Print</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default EmployeePayslips;
