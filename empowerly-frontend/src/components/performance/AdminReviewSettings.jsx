import React, { useState, useEffect } from 'react';
import { performanceReviewAPI } from '../../services/api';
import './AdminReviewSettings.css';

const AdminReviewSettings = () => {
    const [reviews, setReviews] = useState([]);
    const [cycles, setCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('reviews');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [reviewsRes, cyclesRes] = await Promise.all([
                performanceReviewAPI.getAllReviews(),
                performanceReviewAPI.getAllCycles(),
            ]);
            setReviews(reviewsRes.data);
            setCycles(cyclesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="admin-settings-container">
            <h1>Performance Review Administration</h1>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    All Reviews ({reviews.length})
                </button>
                <button
                    className={`tab ${activeTab === 'cycles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cycles')}
                >
                    All Cycles ({cycles.length})
                </button>
                <button
                    className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    Statistics
                </button>
            </div>

            {activeTab === 'reviews' && (
                <div className="tab-content">
                    <h2>All Performance Reviews</h2>
                    <div className="reviews-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Cycle</th>
                                    <th>Status</th>
                                    <th>Final Score</th>
                                    <th>Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map(review => (
                                    <tr key={review.id}>
                                        <td>{review.employeeName}</td>
                                        <td>{review.cycleName}</td>
                                        <td>
                                            <span className={`status-badge status-${review.status.toLowerCase()}`}>
                                                {review.status}
                                            </span>
                                        </td>
                                        <td>
                                            {review.finalScore ? review.finalScore.toFixed(2) : 'N/A'}
                                        </td>
                                        <td>
                                            {review.submittedAt
                                                ? new Date(review.submittedAt).toLocaleDateString()
                                                : 'Not submitted'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'cycles' && (
                <div className="tab-content">
                    <h2>All Review Cycles</h2>
                    <div className="cycles-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Total Reviews</th>
                                    <th>Approved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cycles.map(cycle => (
                                    <tr key={cycle.id}>
                                        <td>{cycle.name}</td>
                                        <td>
                                            <span className={`status-badge status-${cycle.status.toLowerCase()}`}>
                                                {cycle.status}
                                            </span>
                                        </td>
                                        <td>{new Date(cycle.startDate).toLocaleDateString()}</td>
                                        <td>{new Date(cycle.endDate).toLocaleDateString()}</td>
                                        <td>{cycle.totalReviews}</td>
                                        <td>{cycle.approvedReviews}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'stats' && (
                <div className="tab-content">
                    <h2>System Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{reviews.length}</div>
                            <div className="stat-label">Total Reviews</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">
                                {reviews.filter(r => r.status === 'APPROVED').length}
                            </div>
                            <div className="stat-label">Approved Reviews</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{cycles.length}</div>
                            <div className="stat-label">Total Cycles</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">
                                {cycles.filter(c => c.status === 'ACTIVE').length}
                            </div>
                            <div className="stat-label">Active Cycles</div>
                        </div>
                    </div>

                    <div className="average-scores">
                        <h3>Average Scores by Status</h3>
                        <div className="scores-list">
                            {['APPROVED', 'REVIEWED', 'SUBMITTED'].map(status => {
                                const statusReviews = reviews.filter(r => r.status === status && r.finalScore);
                                const avg = statusReviews.length > 0
                                    ? (statusReviews.reduce((sum, r) => sum + r.finalScore, 0) / statusReviews.length).toFixed(2)
                                    : 'N/A';
                                return (
                                    <div key={status} className="score-item">
                                        <span>{status}:</span>
                                        <strong>{avg}</strong>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReviewSettings;
