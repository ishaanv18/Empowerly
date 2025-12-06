import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { skillAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import './SkillDevelopment.css';

const SkillDevelopment = () => {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(null);

    useEffect(() => {
        fetchActiveSuggestion();
    }, []);

    const fetchActiveSuggestion = async () => {
        try {
            const response = await skillAPI.getActiveSuggestion();
            setActiveSuggestion(response.data);
        } catch (error) {
            // No active suggestion
        }
    };

    const handleGenerateSuggestions = async () => {
        setGenerating(true);
        try {
            const response = await skillAPI.generateSuggestions();
            setActiveSuggestion(response.data);
            showNotification('AI-powered skill suggestions generated!', 'success');
        } catch (error) {
            showNotification('Failed to generate suggestions', 'error');
        } finally {
            setGenerating(false);
        }
    };

    const handleMarkCompleted = async (skill) => {
        setLoading(true);
        try {
            const response = await skillAPI.markSkillCompleted(skill);
            setActiveSuggestion(response.data);
            showNotification(`Marked "${skill}" as completed!`, 'success');
        } catch (error) {
            showNotification('Failed to mark skill as completed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="skill-development-container">
            <div className="skill-header">
                <h2>🎓 Skill Development & Learning</h2>
                <p>AI-powered personalized learning recommendations</p>
            </div>

            {!activeSuggestion ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="generate-section card"
                >
                    <div className="generate-content">
                        <div className="icon">🤖</div>
                        <h3>Get Personalized Skill Recommendations</h3>
                        <p>Our AI will analyze your role and suggest relevant skills with free course recommendations</p>
                        <button
                            className="btn-generate"
                            onClick={handleGenerateSuggestions}
                            disabled={generating}
                        >
                            {generating ? '🔄 Generating...' : '✨ Generate Suggestions'}
                        </button>
                    </div>
                </motion.div>
            ) : (
                <div className="suggestions-content">
                    {/* Skills Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="skills-section card"
                    >
                        <h3>📚 Recommended Skills</h3>
                        <div className="skills-grid">
                            {activeSuggestion.suggestedSkills.map((skill, index) => (
                                <div
                                    key={index}
                                    className={`skill-card ${activeSuggestion.completedSkills.includes(skill) ? 'completed' : ''}`}
                                >
                                    <div className="skill-name">{skill}</div>
                                    {activeSuggestion.completedSkills.includes(skill) ? (
                                        <span className="completed-badge">✓ Completed</span>
                                    ) : (
                                        <button
                                            className="btn-mark-complete"
                                            onClick={() => handleMarkCompleted(skill)}
                                            disabled={loading}
                                        >
                                            Mark Complete
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Courses Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="courses-section card"
                    >
                        <h3>🎯 Free Course Recommendations</h3>
                        <div className="courses-grid">
                            {activeSuggestion.recommendedCourses.map((course, index) => (
                                <div key={index} className="course-card">
                                    <div className="course-header">
                                        <h4>{course.title}</h4>
                                        <span className={`level-badge ${course.level.toLowerCase()}`}>
                                            {course.level}
                                        </span>
                                    </div>
                                    <div className="course-platform">
                                        📺 {course.platform}
                                    </div>
                                    <p className="course-description">{course.description}</p>
                                    <div className="course-footer">
                                        <span className="duration">⏱️ {course.duration}</span>
                                        <a
                                            href={course.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-course"
                                        >
                                            Start Learning →
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <button
                        className="btn-regenerate"
                        onClick={handleGenerateSuggestions}
                        disabled={generating}
                    >
                        {generating ? '🔄 Regenerating...' : '🔄 Generate New Suggestions'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SkillDevelopment;
