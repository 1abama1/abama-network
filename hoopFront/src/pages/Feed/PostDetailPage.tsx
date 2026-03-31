import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';
import PostCard from '../../components/Feed/PostCard';
import './PostDetailPage.css';
import { formatDistanceToNow } from 'date-fns';

const PostDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPostAndComments = async () => {
    try {
      setLoading(true);
      const [postRes, commentsRes] = await Promise.all([
        axiosInstance.get(`/posts/${postId}`),
        axiosInstance.get(`/posts/${postId}/comments`)
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data || []);
    } catch (error) {
      console.error('Failed to load post details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPostAndComments();
    }
  }, [postId]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await axiosInstance.post(`/posts/${postId}/comment`, { content: replyContent });
      setReplyContent('');
      fetchPostAndComments(); // refresh to get new comment and updated count
    } catch (error) {
      console.error('Failed to submit reply', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="home-feed">
        <div className="feed-header">
          <h2>Post</h2>
        </div>
        <div className="feed-loading">
          <div className="basketball-spinner" />
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="home-feed">
        <div className="feed-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h2>Post not found</h2>
        </div>
        <div className="empty-feed">
          <p>This post may have been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-feed">
      <div className="feed-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h2>Post</h2>
        </div>
      </div>

      <div className="post-detail-main">
        <PostCard 
          post={post} 
          onUpdate={fetchPostAndComments} 
          onNavigateToPost={() => {}} // empty so it doesn't navigate again
        />
      </div>

      <div className="post-detail-reply-section">
        <div className="reply-avatar">
          <div className="avatar-placeholder-small">YOU</div>
        </div>
        <form onSubmit={handleReplySubmit} className="reply-form">
          <input
            type="text"
            placeholder="Post your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            disabled={isSubmitting}
            className="reply-input"
          />
          <button 
            type="submit" 
            className="reply-submit-btn"
            disabled={!replyContent.trim() || isSubmitting}
          >
            {isSubmitting ? '...' : <Send size={16} />}
          </button>
        </form>
      </div>

      <div className="post-detail-comments">
        {comments.length === 0 ? (
          <div className="no-comments-yet">No comments yet. Be the first to reply!</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="detail-comment-card glass">
              <div className="comment-avatar">
                {comment.author.username.charAt(0).toUpperCase()}
              </div>
              <div className="comment-content-wrapper">
                <div className="comment-header-row">
                  <span className="comment-author-name">@{comment.author.username}</span>
                  <span className="comment-time">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                </div>
                <p className="comment-text">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;
