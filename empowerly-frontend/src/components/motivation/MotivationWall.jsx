import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { motivationAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import './MotivationWall.css';

const MotivationWall = () => {
    const { showNotification } = useNotification();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [newPost, setNewPost] = useState({
        content: '',
        category: 'ACHIEVEMENT'
    });
    const [commentInputs, setCommentInputs] = useState({});
    const [generatingQuote, setGeneratingQuote] = useState(false);

    const categories = ['ALL', 'ACHIEVEMENT', 'LEARNING', 'QUOTE', 'ANNOUNCEMENT'];
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchPosts();
    }, [filterCategory]);

    const fetchPosts = async () => {
        try {
            const response = filterCategory === 'ALL'
                ? await motivationAPI.getAllPosts()
                : await motivationAPI.getPostsByCategory(filterCategory);
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await motivationAPI.createPost(newPost);
            showNotification('Post created successfully!', 'success');
            setNewPost({ content: '', category: 'ACHIEVEMENT' });
            setShowCreateModal(false);
            fetchPosts();
        } catch (error) {
            showNotification('Failed to create post', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const response = await motivationAPI.toggleLike(postId);
            setPosts(posts.map(p => p.id === postId ? response.data : p));
        } catch (error) {
            showNotification('Failed to like post', 'error');
        }
    };

    const handleComment = async (postId) => {
        const content = commentInputs[postId];
        if (!content || !content.trim()) return;

        try {
            const response = await motivationAPI.addComment(postId, content);
            setPosts(posts.map(p => p.id === postId ? response.data : p));
            setCommentInputs({ ...commentInputs, [postId]: '' });
            showNotification('Comment added!', 'success');
        } catch (error) {
            showNotification('Failed to add comment', 'error');
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await motivationAPI.deletePost(postId);
            setPosts(posts.filter(p => p.id !== postId));
            showNotification('Post deleted successfully', 'success');
        } catch (error) {
            showNotification('Failed to delete post', 'error');
        }
    };

    const handleGenerateQuote = async () => {
        setGeneratingQuote(true);
        try {
            const response = await motivationAPI.generateQuote(newPost.category);
            setNewPost({ ...newPost, content: response.data.quote });
            showNotification('AI quote generated!', 'success');
        } catch (error) {
            showNotification('Failed to generate quote', 'error');
        } finally {
            setGeneratingQuote(false);
        }
    };

    const getCategoryIcon = (category) => {
        const icons = {
            ACHIEVEMENT: '🏆',
            LEARNING: '📚',
            QUOTE: '💭',
            ANNOUNCEMENT: '📢'
        };
        return icons[category] || '✨';
    };

    return (
        <div className="motivation-wall-container">
            <div className="motivation-header">
                <h2>💪 Motivation Wall</h2>
                <p>Share achievements, learnings, and inspiration</p>
            </div>

            {/* Filter and Create */}
            <div className="motivation-controls">
                <div className="category-filters">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
                            onClick={() => setFilterCategory(cat)}
                        >
                            {cat === 'ALL' ? '🌟 All' : `${getCategoryIcon(cat)} ${cat}`}
                        </button>
                    ))}
                </div>
                <button className="btn-create-post" onClick={() => setShowCreateModal(true)}>
                    ✍️ Create Post
                </button>
            </div>

            {/* Posts Feed */}
            <div className="posts-feed">
                {posts.length === 0 ? (
                    <div className="empty-state">
                        <p>No posts yet. Be the first to share something inspiring!</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`post-card ${post.isHRPost ? 'hr-post' : ''}`}
                        >
                            <div className="post-header">
                                <div className="post-author">
                                    <div className="author-avatar">
                                        {post.authorName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="author-info">
                                        <h4>{post.authorName}</h4>
                                        <span className="author-role">{post.authorRole}</span>
                                    </div>
                                </div>
                                <div className="post-meta">
                                    <span className={`category-badge ${post.category.toLowerCase()}`}>
                                        {getCategoryIcon(post.category)} {post.category}
                                    </span>
                                    {(post.authorId === user.id || user.role === 'HR' || user.role === 'ADMIN') && (
                                        <button
                                            className="btn-delete-post"
                                            onClick={() => handleDelete(post.id)}
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="post-content">
                                <p>{post.content}</p>
                            </div>

                            <div className="post-footer">
                                <button
                                    className={`btn-like ${post.likes.includes(user.id) ? 'liked' : ''}`}
                                    onClick={() => handleLike(post.id)}
                                >
                                    ❤️ {post.likes.length}
                                </button>
                                <span className="comment-count">💬 {post.comments.length}</span>
                            </div>

                            {/* Comments Section */}
                            {post.comments.length > 0 && (
                                <div className="comments-section">
                                    {post.comments.map((comment, idx) => (
                                        <div key={idx} className="comment">
                                            <strong>{comment.userName}:</strong> {comment.content}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Comment */}
                            <div className="add-comment">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={commentInputs[post.id] || ''}
                                    onChange={(e) => setCommentInputs({
                                        ...commentInputs,
                                        [post.id]: e.target.value
                                    })}
                                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                                />
                                <button onClick={() => handleComment(post.id)}>Send</button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>✍️ Create New Post</h3>
                            <button className="btn-close" onClick={() => setShowCreateModal(false)}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreatePost} className="modal-body">
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={newPost.category}
                                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                    required
                                >
                                    <option value="ACHIEVEMENT">🏆 Achievement</option>
                                    <option value="LEARNING">📚 Learning</option>
                                    <option value="QUOTE">💭 Quote</option>
                                    <option value="ANNOUNCEMENT">📢 Announcement</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Content</label>
                                <textarea
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                    placeholder="Share something inspiring..."
                                    rows="5"
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn-generate-quote"
                                    onClick={handleGenerateQuote}
                                    disabled={generatingQuote}
                                >
                                    {generatingQuote ? '✨ Generating...' : '✨ Generate AI Quote'}
                                </button>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Posting...' : '📝 Post'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MotivationWall;
