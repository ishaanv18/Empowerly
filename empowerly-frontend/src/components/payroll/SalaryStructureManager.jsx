import React, { useState, useEffect } from 'react';
import { payrollAPI } from '../../services/api';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { motion } from 'framer-motion';
import './SalaryStructureManager.css';

const SalaryStructureManager = () => {
    const { showNotification } = useNotification();
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [salaryData, setSalaryData] = useState({
        basicSalary: 50000,
        hra: 15000,
        da: 5000,
        travelAllowance: 3000,
        medicalAllowance: 2000,
        otherAllowances: 0,
        taxPercentage: 10,
        pfPercentage: 12
    });
    const [loading, setLoading] = useState(true);
    const [salaryStructures, setSalaryStructures] = useState([]);
    const [showViewSection, setShowViewSection] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            fetchSalaryStructure(selectedEmployee.id);
        }
    }, [selectedEmployee]);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/users');
            // Show all users in the database
            setEmployees(response.data);
        } catch (err) {
            console.error('Failed to load employees', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSalaryStructure = async (employeeId) => {
        try {
            const response = await payrollAPI.getSalaryStructure(employeeId);
            if (response.data) {
                // Populate form with existing salary structure
                setSalaryData({
                    basicSalary: response.data.basicSalary || 50000,
                    hra: response.data.hra || 15000,
                    da: response.data.da || 5000,
                    travelAllowance: response.data.travelAllowance || 3000,
                    medicalAllowance: response.data.medicalAllowance || 2000,
                    otherAllowances: response.data.otherAllowances || 0,
                    taxPercentage: response.data.taxPercentage || 10,
                    pfPercentage: response.data.pfPercentage || 12
                });
            } else {
                // Reset to defaults if no salary structure exists
                resetForm();
            }
        } catch (err) {
            // If no salary structure found, reset to defaults
            resetForm();
        }
    };

    const fetchAllSalaryStructures = async () => {
        try {
            const response = await payrollAPI.getAllSalaryStructures();
            setSalaryStructures(response.data);
        } catch (err) {
            console.error('Failed to load salary structures', err);
        }
    };

    const handleSaveSalaryStructure = async () => {
        if (!selectedEmployee) {
            showNotification('Please select an employee', 'warning');
            return;
        }

        try {
            await api.post('/payroll/salary-structure', {
                employeeId: selectedEmployee.id,
                ...salaryData,
                effectiveFrom: new Date().toISOString().split('T')[0]
            });
            showNotification('Salary structure saved successfully!', 'success');
            setSelectedEmployee(null);
            resetForm();
        } catch (err) {
            showNotification('Failed to save salary structure', 'error');
            console.error(err);
        }
    };

    const resetForm = () => {
        setSalaryData({
            basicSalary: 50000,
            hra: 15000,
            da: 5000,
            travelAllowance: 3000,
            medicalAllowance: 2000,
            otherAllowances: 0,
            taxPercentage: 10,
            pfPercentage: 12
        });
    };

    const calculateGross = () => {
        return salaryData.basicSalary + salaryData.hra + salaryData.da +
            salaryData.travelAllowance + salaryData.medicalAllowance + salaryData.otherAllowances;
    };

    const calculateDeductions = () => {
        const gross = calculateGross();
        const tax = gross * (salaryData.taxPercentage / 100);
        const pf = salaryData.basicSalary * (salaryData.pfPercentage / 100);
        return tax + pf;
    };

    const calculateNet = () => {
        return calculateGross() - calculateDeductions();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const getEmployeeName = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? employee.name : 'Unknown';
    };

    if (loading) return <div className="loading">Loading employees...</div>;

    return (
        <div className="salary-manager-container">
            <div className="manager-header">
                <div>
                    <h2>Salary Structure Management</h2>
                    <p>Set up employee salary structures for payroll generation</p>
                </div>
                <button
                    className="btn-view"
                    onClick={() => {
                        setShowViewSection(!showViewSection);
                        if (!showViewSection) {
                            fetchAllSalaryStructures();
                        }
                    }}
                >
                    {showViewSection ? '✏️ Edit Structures' : '👁️ View Existing Structures'}
                </button>
            </div>

            {showViewSection ? (
                <div className="view-structures-section">
                    <h3>Existing Salary Structures</h3>
                    {salaryStructures.length === 0 ? (
                        <p className="no-structures">No salary structures found</p>
                    ) : (
                        <div className="structures-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Basic Salary</th>
                                        <th>HRA</th>
                                        <th>DA</th>
                                        <th>Travel</th>
                                        <th>Medical</th>
                                        <th>Other</th>
                                        <th>Tax %</th>
                                        <th>PF %</th>
                                        <th>Gross Salary</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salaryStructures.map((structure) => {
                                        const gross = structure.basicSalary + structure.hra + structure.da +
                                            structure.travelAllowance + structure.medicalAllowance +
                                            structure.otherAllowances;
                                        return (
                                            <tr key={structure.id}>
                                                <td className="employee-name">{getEmployeeName(structure.employeeId)}</td>
                                                <td>{formatCurrency(structure.basicSalary)}</td>
                                                <td>{formatCurrency(structure.hra)}</td>
                                                <td>{formatCurrency(structure.da)}</td>
                                                <td>{formatCurrency(structure.travelAllowance)}</td>
                                                <td>{formatCurrency(structure.medicalAllowance)}</td>
                                                <td>{formatCurrency(structure.otherAllowances)}</td>
                                                <td>{structure.taxPercentage}%</td>
                                                <td>{structure.pfPercentage}%</td>
                                                <td className="gross-total">{formatCurrency(gross)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (

                <div className="manager-content">
                    <div className="employee-list">
                        <h3>Employees</h3>
                        {employees.length === 0 ? (
                            <p className="no-employees">No employees found</p>
                        ) : (
                            employees.map((emp) => (
                                <motion.div
                                    key={emp.id}
                                    className={`employee-card ${selectedEmployee?.id === emp.id ? 'selected' : ''}`}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setSelectedEmployee(emp)}
                                >
                                    <div className="emp-name">{emp.name}</div>
                                    <div className="emp-email">{emp.email}</div>
                                    <div className="emp-dept">{emp.department || 'N/A'}</div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <div className="salary-form">
                        {selectedEmployee ? (
                            <>
                                <div className="form-header">
                                    <h3>Salary Structure for {selectedEmployee.name}</h3>
                                </div>

                                <div className="form-section">
                                    <h4>Basic Salary</h4>
                                    <input
                                        type="number"
                                        value={salaryData.basicSalary}
                                        onChange={(e) => setSalaryData({ ...salaryData, basicSalary: parseFloat(e.target.value) || 0 })}
                                        placeholder="Basic Salary"
                                    />
                                </div>

                                <div className="form-section">
                                    <h4>Allowances</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>HRA</label>
                                            <input
                                                type="number"
                                                value={salaryData.hra}
                                                onChange={(e) => setSalaryData({ ...salaryData, hra: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>DA</label>
                                            <input
                                                type="number"
                                                value={salaryData.da}
                                                onChange={(e) => setSalaryData({ ...salaryData, da: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Travel Allowance</label>
                                            <input
                                                type="number"
                                                value={salaryData.travelAllowance}
                                                onChange={(e) => setSalaryData({ ...salaryData, travelAllowance: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Medical Allowance</label>
                                            <input
                                                type="number"
                                                value={salaryData.medicalAllowance}
                                                onChange={(e) => setSalaryData({ ...salaryData, medicalAllowance: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Other Allowances</label>
                                            <input
                                                type="number"
                                                value={salaryData.otherAllowances}
                                                onChange={(e) => setSalaryData({ ...salaryData, otherAllowances: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h4>Deduction Percentages</h4>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Tax %</label>
                                            <input
                                                type="number"
                                                value={salaryData.taxPercentage}
                                                onChange={(e) => setSalaryData({ ...salaryData, taxPercentage: parseFloat(e.target.value) || 0 })}
                                                step="0.1"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>PF %</label>
                                            <input
                                                type="number"
                                                value={salaryData.pfPercentage}
                                                onChange={(e) => setSalaryData({ ...salaryData, pfPercentage: parseFloat(e.target.value) || 0 })}
                                                step="0.1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="salary-preview">
                                    <h4>Salary Preview</h4>
                                    <div className="preview-row">
                                        <span>Gross Salary:</span>
                                        <span className="amount">{formatCurrency(calculateGross())}</span>
                                    </div>
                                    <div className="preview-row">
                                        <span>Total Deductions:</span>
                                        <span className="amount deduction">- {formatCurrency(calculateDeductions())}</span>
                                    </div>
                                    <div className="preview-row total">
                                        <span>Net Salary:</span>
                                        <span className="amount">{formatCurrency(calculateNet())}</span>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button className="btn-cancel" onClick={() => { setSelectedEmployee(null); resetForm(); }}>
                                        Cancel
                                    </button>
                                    <button className="btn-save" onClick={handleSaveSalaryStructure}>
                                        Save Salary Structure
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="no-selection">
                                <p>Select an employee to set up their salary structure</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryStructureManager;
