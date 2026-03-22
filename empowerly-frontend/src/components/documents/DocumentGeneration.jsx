import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { documentAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import './DocumentGeneration.css';

const DocumentGeneration = () => {
    const { showNotification } = useNotification();
    const [documentType, setDocumentType] = useState('OFFER_LETTER');
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);

    // Offer Letter Form
    const [offerLetterForm, setOfferLetterForm] = useState({
        employeeName: '',
        email: '',
        position: '',
        salary: '',
        department: '',
        joiningDate: ''
    });

    // Appointment Letter Form
    const [appointmentLetterForm, setAppointmentLetterForm] = useState({
        employeeName: '',
        email: '',
        position: '',
        salary: '',
        department: '',
        joiningDate: '',
        workLocation: '',
        reportingTo: ''
    });

    useEffect(() => {
        fetchDocumentHistory();
    }, []);

    const fetchDocumentHistory = async () => {
        try {
            const response = await documentAPI.getHistory();
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching document history:', error);
        }
    };

    const handleDeleteDocument = async () => {
        if (!documentToDelete) return;
        setLoading(true);
        try {
            await documentAPI.deleteDocument(documentToDelete.type, documentToDelete.id);
            showNotification('Document deleted successfully', 'success');
            fetchDocumentHistory();
        } catch (error) {
            showNotification('Failed to delete document', 'error');
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
            setDocumentToDelete(null);
        }
    };

    const handleClearAllDocuments = async () => {
        setLoading(true);
        try {
            const response = await documentAPI.clearAllDocuments();
            showNotification(
                `Successfully deleted ${response.data.deletedCount} documents`,
                'success'
            );
            fetchDocumentHistory();
        } catch (error) {
            showNotification('Failed to clear all documents', 'error');
        } finally {
            setLoading(false);
            setShowClearAllConfirm(false);
        }
    };

    const handleGenerateOfferLetter = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await documentAPI.generateOfferLetter(offerLetterForm);
            showNotification('Offer letter generated successfully!', 'success');

            // Download the PDF
            const pdfResponse = await documentAPI.downloadOfferLetter(response.data.id);
            const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Offer_Letter_${offerLetterForm.employeeName}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);

            // Reset form and refresh history
            setOfferLetterForm({
                employeeName: '',
                email: '',
                position: '',
                salary: '',
                department: '',
                joiningDate: ''
            });
            fetchDocumentHistory();
        } catch (error) {
            showNotification('Failed to generate offer letter: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAppointmentLetter = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await documentAPI.generateAppointmentLetter(appointmentLetterForm);
            showNotification('Appointment letter generated successfully!', 'success');

            // Download the PDF
            const pdfResponse = await documentAPI.downloadAppointmentLetter(response.data.id);
            const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Appointment_Letter_${appointmentLetterForm.employeeName}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);

            // Reset form and refresh history
            setAppointmentLetterForm({
                employeeName: '',
                email: '',
                position: '',
                salary: '',
                department: '',
                joiningDate: '',
                workLocation: '',
                reportingTo: ''
            });
            fetchDocumentHistory();
        } catch (error) {
            showNotification('Failed to generate appointment letter: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (doc) => {
        try {
            let response;
            if (doc.type === 'OFFER_LETTER') {
                response = await documentAPI.downloadOfferLetter(doc.id);
            } else {
                response = await documentAPI.downloadAppointmentLetter(doc.id);
            }

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = doc.fileName;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            showNotification('Failed to download document', 'error');
        }
    };

    return (
        <div className="document-generation-container">
            <div className="document-generation-header">
                <h2>📄 Document Generation</h2>
                <p>Generate professional offer letters and appointment letters</p>
            </div>

            {/* Document Type Selector */}
            <div className="document-type-selector">
                <button
                    className={`type-btn ${documentType === 'OFFER_LETTER' ? 'active' : ''}`}
                    onClick={() => setDocumentType('OFFER_LETTER')}
                >
                    📝 Offer Letter
                </button>
                <button
                    className={`type-btn ${documentType === 'APPOINTMENT_LETTER' ? 'active' : ''}`}
                    onClick={() => setDocumentType('APPOINTMENT_LETTER')}
                >
                    📋 Appointment Letter
                </button>
            </div>

            {/* Forms */}
            <div className="document-form-container card">
                {documentType === 'OFFER_LETTER' ? (
                    <form onSubmit={handleGenerateOfferLetter}>
                        <h3>Generate Offer Letter</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Employee Name *</label>
                                <input
                                    type="text"
                                    value={offerLetterForm.employeeName}
                                    onChange={(e) => setOfferLetterForm({ ...offerLetterForm, employeeName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    value={offerLetterForm.email}
                                    onChange={(e) => setOfferLetterForm({ ...offerLetterForm, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Position *</label>
                                <input
                                    type="text"
                                    value={offerLetterForm.position}
                                    onChange={(e) => setOfferLetterForm({ ...offerLetterForm, position: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Annual Salary (₹) *</label>
                                <input
                                    type="number"
                                    value={offerLetterForm.salary}
                                    onChange={(e) => setOfferLetterForm({ ...offerLetterForm, salary: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Department *</label>
                                <select
                                    value={offerLetterForm.department}
                                    onChange={(e) => setOfferLetterForm({ ...offerLetterForm, department: e.target.value })}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    <option value="FINANCE">Finance</option>
                                    <option value="HR">HR</option>
                                    <option value="BACKEND">Backend</option>
                                    <option value="FRONTEND">Frontend</option>
                                    <option value="DEVOPS">DevOps</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Joining Date *</label>
                                <input
                                    type="date"
                                    value={offerLetterForm.joiningDate}
                                    onChange={(e) => setOfferLetterForm({ ...offerLetterForm, joiningDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-generate" disabled={loading}>
                            {loading ? 'Generating...' : '📥 Generate & Download Offer Letter'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleGenerateAppointmentLetter}>
                        <h3>Generate Appointment Letter</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Employee Name *</label>
                                <input
                                    type="text"
                                    value={appointmentLetterForm.employeeName}
                                    onChange={(e) => setAppointmentLetterForm({ ...appointmentLetterForm, employeeName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    value={appointmentLetterForm.email}
                                    onChange={(e) => setAppointmentLetterForm({ ...appointmentLetterForm, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Position *</label>
                                <input
                                    type="text"
                                    value={appointmentLetterForm.position}
                                    onChange={(e) => setAppointmentLetterForm({ ...appointmentLetterForm, position: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Annual Salary (₹) *</label>
                                <input
                                    type="number"
                                    value={appointmentLetterForm.salary}
                                    onChange={(e) => setAppointmentLetterForm({ ...appointmentLetterForm, salary: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Department *</label>
                                <select
                                    value={appointmentLetterForm.department}
                                    onChange={(e) => setAppointmentLetterForm({ ...appointmentLetterForm, department: e.target.value })}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    <option value="FINANCE">Finance</option>
                                    <option value="HR">HR</option>
                                    <option value="BACKEND">Backend</option>
                                    <option value="FRONTEND">Frontend</option>
                                    <option value="DEVOPS">DevOps</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Joining Date *</label>
                                <input
                                    type="date"
                                    value={appointmentLetterForm.joiningDate}
                                    onChange={(e) => setAppointmentLetterForm({ ...appointmentLetterForm, joiningDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Work Location *</label>
                                <input
                                    type="text"
                                    value={appointmentLetterForm.workLocation}
                                    onChange={(e) => setAppointmentLetterForm({ ...appointmentLetterForm, workLocation: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Reporting To *</label>
                                <input
                                    type="text"
                                    value={appointmentLetterForm.reportingTo}
                                    onChange={(e) => setAppointmentLetterForm({ ...appointmentLetterForm, reportingTo: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-generate" disabled={loading}>
                            {loading ? 'Generating...' : '📥 Generate & Download Appointment Letter'}
                        </button>
                    </form>
                )}
            </div>

            {/* Document History */}
            <div className="document-history card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>📚 Document History</h3>
                    {documents.length > 0 && (
                        <button
                            className="btn-clear-all"
                            onClick={() => setShowClearAllConfirm(true)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            🗑️ Clear All Documents
                        </button>
                    )}
                </div>
                {documents.length === 0 ? (
                    <p className="empty-message">No documents generated yet</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Employee Name</th>
                                <th>Position</th>
                                <th>Generated By</th>
                                <th>Generated At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc) => (
                                <tr key={doc.id}>
                                    <td>
                                        <span className={`doc-type-badge ${doc.type.toLowerCase()}`}>
                                            {doc.type === 'OFFER_LETTER' ? '📝 Offer' : '📋 Appointment'}
                                        </span>
                                    </td>
                                    <td>{doc.employeeName}</td>
                                    <td>{doc.position}</td>
                                    <td>{doc.generatedBy}</td>
                                    <td>{new Date(doc.generatedAt).toLocaleString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn-download"
                                                onClick={() => handleDownload(doc)}
                                            >
                                                📥 Download
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => {
                                                    setDocumentToDelete(doc);
                                                    setShowDeleteConfirm(true);
                                                }}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Delete Document Confirmation Modal */}
            {showDeleteConfirm && documentToDelete && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '500px' }}
                    >
                        <div className="modal-header">
                            <h3>⚠️ Confirm Delete</h3>
                            <button className="btn-close" onClick={() => setShowDeleteConfirm(false)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
                                Are you sure you want to delete this document?
                            </p>
                            <div style={{
                                background: '#f3f4f6',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                marginBottom: '1rem'
                            }}>
                                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                                    <strong>Type:</strong> {documentToDelete.type === 'OFFER_LETTER' ? 'Offer Letter' : 'Appointment Letter'}<br />
                                    <strong>Employee:</strong> {documentToDelete.employeeName}<br />
                                    <strong>Position:</strong> {documentToDelete.position}
                                </p>
                            </div>
                            <div style={{
                                background: '#fef2f2',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                marginBottom: '1rem'
                            }}>
                                <strong style={{ color: '#dc2626' }}>⚠️ Warning:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', color: '#7f1d1d', fontSize: '0.875rem' }}>
                                    This action cannot be undone. The document will be permanently deleted.
                                </p>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn-submit"
                                    onClick={handleDeleteDocument}
                                    disabled={loading}
                                    style={{ background: '#ef4444' }}
                                >
                                    {loading ? 'Deleting...' : '🗑️ Delete Document'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Clear All Documents Confirmation Modal */}
            {showClearAllConfirm && (
                <div className="modal-overlay" onClick={() => setShowClearAllConfirm(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '500px' }}
                    >
                        <div className="modal-header">
                            <h3>⚠️ Confirm Clear All Documents</h3>
                            <button className="btn-close" onClick={() => setShowClearAllConfirm(false)}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
                                Are you sure you want to delete ALL documents from the database?
                            </p>
                            <div style={{
                                background: '#fef2f2',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                marginBottom: '1rem'
                            }}>
                                <strong style={{ color: '#dc2626' }}>⚠️ Critical Warning:</strong>
                                <p style={{ margin: '0.5rem 0 0 0', color: '#7f1d1d', fontSize: '0.875rem' }}>
                                    This will permanently delete all {documents.length} documents (both offer letters and appointment letters) from the database. This action cannot be undone!
                                </p>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowClearAllConfirm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn-submit"
                                    onClick={handleClearAllDocuments}
                                    disabled={loading}
                                    style={{ background: '#ef4444' }}
                                >
                                    {loading ? 'Clearing...' : '🗑️ Clear All Documents'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default DocumentGeneration;
