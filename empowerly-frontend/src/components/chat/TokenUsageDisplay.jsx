import React, { useState, useEffect } from 'react';
import { tokenUsageAPI } from '../../services/api';
import './TokenUsageDisplay.css';

const TokenUsageDisplay = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await tokenUsageAPI.getStats();
            setStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching token stats:', error);
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return null;
    }

    const tokenPercentage = (stats.tokensUsed / stats.tokensLimit) * 100;
    const requestPercentage = (stats.requestsUsed / stats.requestsLimit) * 100;

    const getColorClass = (percentage) => {
        if (percentage >= 90) return 'danger';
        if (percentage >= 70) return 'warning';
        return 'success';
    };

    return (
        <div className="token-usage-display">
            <div className="usage-header">
                <h4>🤖 AI Usage Today</h4>
                <span className="reset-time">Resets at midnight IST</span>
            </div>

            <div className="usage-stats">
                <div className="stat-item">
                    <div className="stat-label">
                        <span>Tokens</span>
                        <span className="stat-value">{stats.tokensUsed} / {stats.tokensLimit}</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className={`progress-fill ${getColorClass(tokenPercentage)}`}
                            style={{ width: `${Math.min(tokenPercentage, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="stat-item">
                    <div className="stat-label">
                        <span>Requests</span>
                        <span className="stat-value">{stats.requestsUsed} / {stats.requestsLimit}</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className={`progress-fill ${getColorClass(requestPercentage)}`}
                            style={{ width: `${Math.min(requestPercentage, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {(tokenPercentage >= 90 || requestPercentage >= 90) && (
                <div className="usage-warning">
                    ⚠️ You're approaching your daily limit!
                </div>
            )}

            {(stats.tokensRemaining <= 0 || stats.requestsRemaining <= 0) && (
                <div className="usage-error">
                    🚫 Daily limit reached. Resets at midnight IST.
                </div>
            )}
        </div>
    );
};

export default TokenUsageDisplay;
