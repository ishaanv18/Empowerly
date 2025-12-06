import React, { useState, useEffect } from 'react';
import { performanceReviewAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './EmployeeSelfAssessment.css';

const RATING_CATEGORIES = [
    { key: 'Communication', label: 'Communication' },
    { key: 'Teamwork', label: 'Teamwork' },
    { key: 'TechnicalSkills', label: 'Technical Skills' },
    { key: 'Attendance', label: 'Attendance / Punctuality' },
    { key: 'ProblemSolving', label: 'Problem Solving' },
];

const ViewMyReviews = () => {
    const { user } = useAuth();
    const [cycles, setCycles] = useState([]);
    const [selectedCycle, setSelectedCycle] = useState('');
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCycles();
    }, []);

    useEffect(() => {
        if (selectedCycle) {
            fetchMyReview();
        }
    }, [selectedCycle]);

    const fetchCycles = async () => {
        try {
            const response = await performanceReviewAPI.getAllCycles();
            // Show all cycles so employees can view past reviews
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

    const fetchMyReview = async () => {
        try {
            const response = await performanceReviewAPI.getMyReview(selectedCycle);
            setReview(response.data);
        } catch (error) {
            console.error('Error fetching review:', error);
            setReview(null);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (cycles.length === 0) {
        return (
            <div className="self-assessment-container">
                <div className="no-cycles">
                    <h2>No Review Cycles</h2>
                    <p>There are currently no performance review cycles.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="self-assessment-container">
            <div className="assessment-header">
                <h1>📊 View My Performance Reviews</h1>
                <div className="cycle-selector">
                    <label>Select Review Cycle:</label>
                    <select
                        value={selectedCycle}
                        onChange={(e) => setSelectedCycle(e.target.value)}
                    >
                        {cycles.map(cycle => (
                            <option key={cycle.id} value={cycle.id}>
                                {cycle.name} ({cycle.status})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {!review && (
                <div className="no-review-message">
                    <p>You haven't submitted a review for this cycle yet.</p>
                </div>
            )}

            {review && (
                <>
                    <div className="review-status">
                        <span className={`status-badge status-${review.status.toLowerCase()}`}>
                            {review.status}
                        </span>
                    </div>

                    {/* Employee Self-Assessment */}
                    <div className="form-section">
                        <h2>Your Self-Assessment</h2>

                        <div className="ratings-display">
                            <h3>Your Self-Ratings</h3>
                            <div className="ratings-grid-display">
                                {RATING_CATEGORIES.map(category => (
                                    <div key={category.key} className="rating-display-item">
                                        <span className="category">{category.label}:</span>
                                        <span className="value">{review.employeeRatings?.[category.key] || 0}/5</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {review.achievements && (
                            <div className="text-section">
                                <h4>Achievements</h4>
                                <p>{review.achievements}</p>
                            </div>
                        )}

                        {review.challenges && (
                            <div className="text-section">
                                <h4>Challenges</h4>
                                <p>{review.challenges}</p>
                            </div>
                        )}

                        {review.goals && (
                            <div className="text-section">
                                <h4>Goals</h4>
                                <p>{review.goals}</p>
                            </div>
                        )}

                        {review.employeeComment && (
                            <div className="text-section">
                                <h4>Additional Comments</h4>
                                <p>{review.employeeComment}</p>
                            </div>
                        )}
                    </div>

                    {/* HR Feedback Section - Report Format */}
                    {(review.status === 'REVIEWED' || review.status === 'APPROVED' || review.status === 'REJECTED') && (
                        <div className="form-section hr-feedback">
                            <h2>📊 Your Performance Review Report</h2>

                            {review.finalScore && (
                                <div className="final-score-card">
                                    <h3>Overall Performance Score</h3>
                                    <div className="score-display">
                                        <span className="score-value">{review.finalScore.toFixed(2)}</span>
                                        <span className="score-max">/5.0</span>
                                    </div>
                                    <div className="score-breakdown">
                                        <small>Comprehensive evaluation based on self-assessment and HR review</small>
                                    </div>
                                </div>
                            )}

                            {review.hrRatings && Object.keys(review.hrRatings).length > 0 && (
                                <div className="ratings-display">
                                    <h3>HR Ratings</h3>
                                    <div className="ratings-grid-display">
                                        {RATING_CATEGORIES.map(category => (
                                            <div key={category.key} className="rating-display-item">
                                                <span className="category">{category.label}:</span>
                                                <span className="value">{review.hrRatings?.[category.key] || 0}/5</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {review.hrComment && (
                                <div className="hr-remarks-section">
                                    <h3>💬 HR Evaluation & Feedback</h3>
                                    <div className="remarks-box">
                                        <div className="remarks-header">
                                            <span className="remarks-icon">📝</span>
                                            <span className="remarks-title">Manager's Remarks</span>
                                        </div>
                                        <div className="remarks-content">
                                            <p>{review.hrComment}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="performance-summary">
                                <h3>📈 Performance Summary</h3>
                                <div className="summary-grid">
                                    <div className="summary-card">
                                        <div className="summary-icon">🎯</div>
                                        <div className="summary-content">
                                            <h4>Review Status</h4>
                                            <p className={`status-text status-${review.status.toLowerCase()}`}>
                                                {review.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="summary-card">
                                        <div className="summary-icon">⭐</div>
                                        <div className="summary-content">
                                            <h4>Final Rating</h4>
                                            <p className="rating-text">{review.finalScore ? review.finalScore.toFixed(2) : 'N/A'} / 5.0</p>
                                        </div>
                                    </div>
                                    <div className="summary-card">
                                        <div className="summary-icon">📅</div>
                                        <div className="summary-content">
                                            <h4>Review Cycle</h4>
                                            <p className="cycle-text">{cycles.find(c => c.id === selectedCycle)?.name || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {review.status === 'APPROVED' && (
                                <div className="review-status-banner approved">
                                    ✅ Your review has been approved! Keep up the excellent work!
                                </div>
                            )}

                            {review.status === 'REJECTED' && (
                                <div className="review-status-banner rejected">
                                    ⚠️ Your review requires attention. Please discuss with HR for next steps.
                                </div>
                            )}
                        </div>
                    )}

                    {!review.hrComment && review.status === 'SUBMITTED' && (
                        <div className="pending-review-message">
                            <h3>⏳ Pending HR Review</h3>
                            <p>Your self-assessment has been submitted and is awaiting HR evaluation.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ViewMyReviews;
