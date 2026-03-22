import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { performanceReviewAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import './HRReviewForm.css';

const RATING_CATEGORIES = [
    { key: 'Communication', label: 'Communication' },
    { key: 'Teamwork', label: 'Teamwork' },
    { key: 'TechnicalSkills', label: 'Technical Skills' },
    { key: 'Attendance', label: 'Attendance / Punctuality' },
    { key: 'ProblemSolving', label: 'Problem Solving' },
];

const HRReviewForm = ({ reviewId: propReviewId, onBack }) => {
    const { showNotification } = useNotification();
    const { reviewId: paramReviewId } = useParams();
    const navigate = useNavigate();
    const reviewId = propReviewId || paramReviewId;
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hrRatings, setHrRatings] = useState({});
    const [hrComment, setHrComment] = useState('');

    useEffect(() => {
        fetchReview();
    }, [reviewId]);

    const fetchReview = async () => {
        try {
            // Get all reviews and find the one we need
            const response = await performanceReviewAPI.getAllReviews();
            const foundReview = response.data.find(r => r.id === reviewId);
            setReview(foundReview);

            if (foundReview?.hrRatings) {
                setHrRatings(foundReview.hrRatings);
                setHrComment(foundReview.hrComment || '');
            }
        } catch (error) {
            console.error('Error fetching review:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRatingChange = (category, value) => {
        setHrRatings({
            ...hrRatings,
            [category]: parseInt(value),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if all categories have been rated (including 0)
        const allRated = RATING_CATEGORIES.every(cat => hrRatings[cat.key] !== undefined && hrRatings[cat.key] !== null);
        if (!allRated) {
            showNotification('Please rate all categories', 'warning');
            return;
        }

        try {
            await performanceReviewAPI.evaluateReview(reviewId, {
                hrRatings,
                hrComment,
            });
            showNotification('Evaluation submitted successfully!', 'success');
            if (onBack) {
                onBack();
            } else {
                navigate('/hr/reviews');
            }
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            showNotification('Failed to submit evaluation', 'error');
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!review) {
        return <div className="error">Review not found</div>;
    }

    // Allow evaluation for SUBMITTED and PENDING reviews
    // Only disable for REVIEWED, APPROVED, or REJECTED
    const isEvaluated = review.status === 'REVIEWED' || review.status === 'APPROVED' || review.status === 'REJECTED';
    const isPending = review.status === 'PENDING';

    return (
        <div className="hr-review-form-container">
            <div className="form-header">
                <h1>Evaluate Performance Review</h1>
                <button
                    onClick={() => onBack ? onBack() : navigate('/hr/reviews')}
                    className="btn btn-secondary"
                >
                    Back to Dashboard
                </button>
            </div>

            <div className="employee-info">
                <h2>{review.employeeName}</h2>
                <span className={`status-badge status-${review.status.toLowerCase()}`}>
                    {review.status}
                </span>
            </div>

            {/* Employee Self-Assessment */}
            <div className="section employee-assessment">
                <h3>Employee Self-Assessment</h3>
                {isPending && (
                    <div className="alert alert-warning">
                        ⚠️ Employee has not submitted their self-assessment. All employee ratings will be counted as 0.
                    </div>
                )}

                <div className="ratings-display">
                    <h4>Self-Ratings</h4>
                    <div className="ratings-grid">
                        {RATING_CATEGORIES.map(category => (
                            <div key={category.key} className="rating-display-item">
                                <span>{category.label}:</span>
                                <strong>{review.employeeRatings?.[category.key] || (isPending ? '0' : 'N/A')}/5</strong>
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

            {/* HR Evaluation Form */}
            <form onSubmit={handleSubmit} className="section hr-evaluation">
                <h3>HR Evaluation</h3>

                <div className="form-section">
                    <h4>Rate Employee (0-5)</h4>
                    <div className="ratings-grid">
                        {RATING_CATEGORIES.map(category => (
                            <div key={category.key} className="rating-item">
                                <label>{category.label}</label>
                                <div className="rating-buttons">
                                    {[0, 1, 2, 3, 4, 5].map(value => (
                                        <button
                                            key={value}
                                            type="button"
                                            className={`rating-btn ${hrRatings[category.key] === value ? 'active' : ''}`}
                                            onClick={() => handleRatingChange(category.key, value)}
                                            disabled={isEvaluated}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>HR Comments & Feedback</label>
                    <textarea
                        value={hrComment}
                        onChange={(e) => setHrComment(e.target.value)}
                        placeholder="Provide detailed feedback on employee performance..."
                        rows="6"
                        disabled={isEvaluated}
                    />
                </div>

                {review.finalScore && (
                    <div className="final-score-display">
                        <h4>Final Score</h4>
                        <div className="score-value">{review.finalScore.toFixed(2)}/5.0</div>
                        <p className="score-formula">
                            (Employee Avg × 0.4) + (HR Avg × 0.6)
                        </p>
                    </div>
                )}

                {!isEvaluated && (
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            Submit Evaluation
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default HRReviewForm;
