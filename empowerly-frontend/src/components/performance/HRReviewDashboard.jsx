import React, { useState, useEffect } from 'react';
import { performanceReviewAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import HRReviewForm from './HRReviewForm';
import './HRReviewDashboard.css';

const HRReviewDashboard = () => {
    const { showNotification } = useNotification();
    const [cycles, setCycles] = useState([]);
    const [selectedCycle, setSelectedCycle] = useState('');
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedReview, setSelectedReview] = useState(null);

    useEffect(() => {
        fetchCycles();
    }, []);

    useEffect(() => {
        if (selectedCycle) {
            fetchReviews();
        }
    }, [selectedCycle]);

    const fetchCycles = async () => {
        try {
            const response = await performanceReviewAPI.getAllCycles();
            setCycles(response.data);
            if (response.data.length > 0) {
                setSelectedCycle(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching cycles:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await performanceReviewAPI.getReviewsByCycle(selectedCycle);
            setReviews(response.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleApprove = async (reviewId) => {
        try {
            await performanceReviewAPI.approveReview(reviewId);
            showNotification('Review approved successfully!', 'success');
            fetchReviews();
        } catch (error) {
            showNotification('Failed to approve review', 'error');
        }
    };

    const handleReject = async (reviewId) => {
        if (window.confirm('Are you sure you want to reject this review?')) {
            try {
                await performanceReviewAPI.rejectReview(reviewId);
                showNotification('Review rejected', 'info');
                fetchReviews();
            } catch (error) {
                showNotification('Failed to reject review', 'error');
            }
        }
    };

    const handleViewDetails = (review) => {
        setSelectedReview(review);
    };

    const handleBackToDashboard = () => {
        setSelectedReview(null);
        fetchReviews(); // Refresh reviews
    };

    const handleFixData = async () => {
        try {
            const response = await performanceReviewAPI.fixData();
            showNotification(response.data || 'Data fixed successfully', 'success');
            fetchReviews(); // Refresh reviews to show fixed names
        } catch (error) {
            showNotification('Failed to fix data', 'error');
        }
    };

    // If a review is selected, show the evaluation view
    if (selectedReview) {
        return (
            <HRReviewForm
                reviewId={selectedReview.id}
                onBack={handleBackToDashboard}
            />
        );
    }

    const filteredReviews = filterStatus === 'ALL'
        ? reviews
        : reviews.filter(r => r.status === filterStatus);

    const selectedCycleData = cycles.find(c => c.id === selectedCycle);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="hr-dashboard-container">
            <div className="dashboard-header">
                <h1>Performance Review Dashboard</h1>
                <select
                    value={selectedCycle}
                    onChange={(e) => setSelectedCycle(e.target.value)}
                    className="cycle-select"
                >
                    {cycles.map(cycle => (
                        <option key={cycle.id} value={cycle.id}>
                            {cycle.name} ({cycle.status})
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleFixData}
                    className="btn btn-warning"
                    style={{ marginLeft: '10px' }}
                >
                    🔧 Fix Data
                </button>
            </div>

            {selectedCycleData && (
                <div className="cycle-stats">
                    <div className="stat-card">
                        <div className="stat-value">{selectedCycleData.totalReviews}</div>
                        <div className="stat-label">Total Reviews</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{selectedCycleData.submittedReviews}</div>
                        <div className="stat-label">Submitted</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{selectedCycleData.approvedReviews}</div>
                        <div className="stat-label">Approved</div>
                    </div>
                </div>
            )}

            <div className="filter-bar">
                <button
                    className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('ALL')}
                >
                    All
                </button>
                <button
                    className={`filter-btn ${filterStatus === 'SUBMITTED' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('SUBMITTED')}
                >
                    Submitted
                </button>
                <button
                    className={`filter-btn ${filterStatus === 'REVIEWED' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('REVIEWED')}
                >
                    Reviewed
                </button>
                <button
                    className={`filter-btn ${filterStatus === 'APPROVED' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('APPROVED')}
                >
                    Approved
                </button>
            </div>

            <div className="reviews-list">
                {filteredReviews.length === 0 ? (
                    <div className="no-reviews">No reviews found</div>
                ) : (
                    filteredReviews.map(review => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div>
                                    <h3>{review.employeeName}</h3>
                                    <span className={`status-badge status-${review.status.toLowerCase()}`}>
                                        {review.status}
                                    </span>
                                </div>
                                {review.finalScore && (
                                    <div className="review-score">
                                        Score: <strong>{review.finalScore.toFixed(2)}/5.0</strong>
                                    </div>
                                )}
                            </div>

                            {review.employeeRatings && (
                                <div className="review-ratings">
                                    <h4>Employee Self-Ratings</h4>
                                    <div className="ratings-row">
                                        {Object.entries(review.employeeRatings).map(([key, value]) => (
                                            <div key={key} className="rating-chip">
                                                {key}: {value}/5
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {review.achievements && (
                                <div className="review-section">
                                    <strong>Achievements:</strong>
                                    <p>{review.achievements}</p>
                                </div>
                            )}

                            <div className="review-actions">
                                <button
                                    onClick={() => handleViewDetails(review)}
                                    className="btn btn-primary"
                                >
                                    {(review.status === 'SUBMITTED' || review.status === 'PENDING') ? 'Evaluate' : 'View Details'}
                                </button>
                                {review.status === 'REVIEWED' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(review.id)}
                                            className="btn btn-success"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(review.id)}
                                            className="btn btn-danger"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HRReviewDashboard;
