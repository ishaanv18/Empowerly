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

const EmployeeSelfAssessment = () => {
    const { user } = useAuth();
    const [cycles, setCycles] = useState([]);
    const [selectedCycle, setSelectedCycle] = useState('');
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        ratings: {},
        comment: '',
        achievements: '',
        challenges: '',
        goals: '',
    });

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

            if (response.data.employeeRatings) {
                setFormData({
                    ratings: response.data.employeeRatings,
                    comment: response.data.employeeComment || '',
                    achievements: response.data.achievements || '',
                    challenges: response.data.challenges || '',
                    goals: response.data.goals || '',
                });
            }
        } catch (error) {
            console.error('Error fetching review:', error);
        }
    };

    const handleRatingChange = (category, value) => {
        setFormData({
            ...formData,
            ratings: {
                ...formData.ratings,
                [category]: parseInt(value),
            },
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all ratings are filled
        const allRated = RATING_CATEGORIES.every(cat => formData.ratings[cat.key]);
        if (!allRated) {
            alert('Please rate all categories');
            return;
        }

        try {
            await performanceReviewAPI.submitSelfAssessment({
                cycleId: selectedCycle,
                ...formData,
            });
            alert('Self-assessment submitted successfully!');
            fetchMyReview();
        } catch (error) {
            console.error('Error submitting assessment:', error);
            alert('Failed to submit assessment');
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (cycles.length === 0) {
        return (
            <div className="no-cycles">
                <h2>No Active Review Cycles</h2>
                <p>There are currently no active performance review cycles.</p>
            </div>
        );
    }

    // Check if deadline has passed
    const isDeadlinePassed = () => {
        if (!cycles.length || !selectedCycle) return false;
        const cycle = cycles.find(c => c.id === selectedCycle);
        if (!cycle) return false;
        const endDate = new Date(cycle.endDate);
        return new Date() > endDate;
    };

    const isSubmitted = review?.status !== 'PENDING';
    const isFormDisabled = isSubmitted || isDeadlinePassed();

    return (
        <div className="self-assessment-container">
            <div className="assessment-header">
                <h1>Performance Self-Assessment</h1>
                <select
                    value={selectedCycle}
                    onChange={(e) => setSelectedCycle(e.target.value)}
                    className="cycle-select"
                >
                    {cycles.map(cycle => (
                        <option key={cycle.id} value={cycle.id}>
                            {cycle.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Deadline Warning */}
            {cycles.length > 0 && selectedCycle && (() => {
                const cycle = cycles.find(c => c.id === selectedCycle);
                if (!cycle) return null;

                const endDate = new Date(cycle.endDate);
                const now = new Date();
                const timeRemaining = endDate - now; // milliseconds
                const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
                const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

                let warningClass = 'deadline-info';
                let warningIcon = 'ℹ️';
                let warningMessage = '';

                if (timeRemaining < 0) {
                    warningClass = 'deadline-expired';
                    warningIcon = '🚫';
                    warningMessage = `Deadline has passed! This cycle ended on ${endDate.toLocaleString()}.`;
                } else if (hoursRemaining < 24) {
                    warningClass = 'deadline-urgent';
                    warningIcon = '⚠️';
                    if (hoursRemaining < 1) {
                        warningMessage = `URGENT: Only ${minutesRemaining} minutes remaining! Deadline: ${endDate.toLocaleString()}.`;
                    } else {
                        warningMessage = `URGENT: Only ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} ${minutesRemaining} min remaining! Deadline: ${endDate.toLocaleString()}.`;
                    }
                } else if (daysRemaining <= 2) {
                    warningClass = 'deadline-warning';
                    warningIcon = '⏰';
                    warningMessage = `WARNING: Only ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining! Deadline: ${endDate.toLocaleString()}.`;
                } else if (daysRemaining <= 7) {
                    warningClass = 'deadline-notice';
                    warningIcon = '📅';
                    warningMessage = `${daysRemaining} days remaining. Deadline: ${endDate.toLocaleString()}.`;
                } else {
                    warningClass = 'deadline-info';
                    warningIcon = 'ℹ️';
                    warningMessage = `Deadline: ${endDate.toLocaleString()} (${daysRemaining} days remaining).`;
                }

                return (
                    <div className={`deadline-banner ${warningClass}`}>
                        <div className="deadline-content">
                            <span className="deadline-icon">{warningIcon}</span>
                            <div className="deadline-text">
                                <strong>{warningMessage}</strong>
                                {timeRemaining >= 0 && !isSubmitted && (
                                    <p className="deadline-tip">
                                        💡 Tip: Complete your self-assessment early to avoid last-minute rush!
                                    </p>
                                )}
                                {timeRemaining < 0 && (
                                    <p className="deadline-tip">
                                        You can no longer submit reviews for this cycle. Please contact HR if you need assistance.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {review && (
                <div className="review-status">
                    <span className={`status-badge status-${review.status.toLowerCase()}`}>
                        {review.status}
                    </span>
                    {review.finalScore && (
                        <div className="final-score">
                            Final Score: <strong>{review.finalScore.toFixed(2)}/5.0</strong>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="assessment-form">
                <div className="form-section">
                    <h2>Rate Yourself (1-5)</h2>
                    <div className="ratings-grid">
                        {RATING_CATEGORIES.map(category => (
                            <div key={category.key} className="rating-item">
                                <label>{category.label}</label>
                                <div className="rating-buttons">
                                    {[1, 2, 3, 4, 5].map(value => (
                                        <button
                                            key={value}
                                            type="button"
                                            className={`rating-btn ${formData.ratings[category.key] === value ? 'active' : ''}`}
                                            onClick={() => handleRatingChange(category.key, value)}
                                            disabled={isFormDisabled}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-section">
                    <h2>Comments & Reflections</h2>

                    <div className="form-group">
                        <label>Achievements</label>
                        <textarea
                            value={formData.achievements}
                            onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                            placeholder="What are your key achievements this period?"
                            rows="4"
                            disabled={isFormDisabled}
                        />
                    </div>

                    <div className="form-group">
                        <label>Challenges</label>
                        <textarea
                            value={formData.challenges}
                            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                            placeholder="What challenges did you face?"
                            rows="4"
                            disabled={isFormDisabled}
                        />
                    </div>

                    <div className="form-group">
                        <label>Goals for Next Cycle</label>
                        <textarea
                            value={formData.goals}
                            onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                            placeholder="What are your goals for the next review period?"
                            rows="4"
                            disabled={isFormDisabled}
                        />
                    </div>

                    <div className="form-group">
                        <label>Additional Comments</label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            placeholder="Any other comments..."
                            rows="3"
                            disabled={isFormDisabled}
                        />
                    </div>
                </div>

                {review?.hrComment && (
                    <div className="form-section hr-feedback">
                        <h2>📊 Your Performance Review Results</h2>

                        {review.finalScore && (
                            <div className="final-score-card">
                                <h3>Final Score</h3>
                                <div className="score-display">
                                    <span className="score-value">{review.finalScore.toFixed(2)}</span>
                                    <span className="score-max">/5.0</span>
                                </div>
                                <div className="score-breakdown">
                                    <small>Employee Self-Rating (40%) + HR Rating (60%)</small>
                                </div>
                            </div>
                        )}

                        <div className="ratings-comparison">
                            <h3>Ratings Comparison</h3>
                            <div className="comparison-grid">
                                {RATING_CATEGORIES.map(category => (
                                    <div key={category.key} className="comparison-item">
                                        <div className="category-name">{category.label}</div>
                                        <div className="ratings-row">
                                            <div className="rating-box employee">
                                                <span className="label">Your Rating:</span>
                                                <span className="value">{formData.ratings[category.key] || 0}/5</span>
                                            </div>
                                            <div className="rating-box hr">
                                                <span className="label">HR Rating:</span>
                                                <span className="value">{review.hrRatings?.[category.key] || 0}/5</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="hr-comment-section">
                            <h3>💬 HR Feedback & Suggestions</h3>
                            <div className="comment-box">
                                <p>{review.hrComment}</p>
                            </div>
                        </div>

                        {review.status === 'APPROVED' && (
                            <div className="review-status-banner approved">
                                ✅ Your review has been approved! Keep up the good work!
                            </div>
                        )}

                        {review.status === 'REJECTED' && (
                            <div className="review-status-banner rejected">
                                ⚠️ Your review needs revision. Please discuss with HR for next steps.
                            </div>
                        )}
                    </div>
                )}

                {!isFormDisabled && (
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            Submit Self-Assessment
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default EmployeeSelfAssessment;
