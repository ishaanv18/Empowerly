import React, { useState, useEffect } from 'react';
import { performanceReviewAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './EmployeeSelfAssessment.css';

const RATING_CATEGORIES = [
    { key: 'Communication', label: 'Communication' },
    { key: 'Teamwork', label: 'Teamwork' },
    { key: 'TechnicalSkills', label: 'Technical Skills' },
    { key: 'Attendance', label: 'Attendance / Punctuality' },
    { key: 'ProblemSolving', label: 'Problem Solving' },
];

const ApplyForReview = () => {
    const { user } = useAuth();
    const { showNotification } = useNotification();
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
            // Show only ACTIVE cycles for submission
            const activeCycles = response.data.filter(c => c.status === 'ACTIVE');
            setCycles(activeCycles);
            if (activeCycles.length > 0) {
                setSelectedCycle(activeCycles[0].id);
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

            if (response.data?.employeeRatings) {
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

        const allRated = RATING_CATEGORIES.every(cat => formData.ratings[cat.key]);
        if (!allRated) {
            showNotification('Please rate all categories', 'warning');
            return;
        }

        try {
            await performanceReviewAPI.submitSelfAssessment({
                cycleId: selectedCycle,
                ratings: formData.ratings,  // Changed from employeeRatings to ratings
                comment: formData.comment,
                achievements: formData.achievements,
                challenges: formData.challenges,
                goals: formData.goals,
            });

            showNotification('Self-assessment submitted successfully!', 'success');
            fetchMyReview();
        } catch (error) {
            console.error('Error submitting assessment:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to submit assessment';
            showNotification(errorMessage, 'error');
        }
    };

    // Check if deadline has passed
    const isDeadlinePassed = () => {
        if (!cycles.length || !selectedCycle) return false;
        const cycle = cycles.find(c => c.id === selectedCycle);
        if (!cycle) return false;
        const endDate = new Date(cycle.endDate);
        return new Date() > endDate;
    };

    const isSubmitted = review && review.status !== 'PENDING';
    const isFormDisabled = isSubmitted || isDeadlinePassed();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (cycles.length === 0) {
        return (
            <div className="self-assessment-container">
                <div className="no-cycles">
                    <h2>No Active Review Cycles</h2>
                    <p>There are currently no active performance review cycles. Please check back later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="self-assessment-container">
            <div className="assessment-header">
                <h1>📝 Apply for Performance Review</h1>
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

            {/* Deadline Warning Banner */}
            {(() => {
                if (!cycles.length || !selectedCycle) return null;

                const cycle = cycles.find(c => c.id === selectedCycle);
                if (!cycle) return null;

                const endDate = new Date(cycle.endDate);
                const now = new Date();
                const timeRemaining = endDate - now;
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
                        <div className="banner-content">
                            <span className="banner-icon">{warningIcon}</span>
                            <span className="banner-message">{warningMessage}</span>
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
                        <label>Future Goals</label>
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

export default ApplyForReview;
