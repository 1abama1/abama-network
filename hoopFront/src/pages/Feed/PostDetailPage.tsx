import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { postService } from '../../api/services/postService';
import { commentService } from '../../api/services/commentService';
import { useToast } from '../../components/Common/Toast';
import { renderContentWithMentions } from '../../utils/renderContentWithMentions';
import { ensureUtc } from '../../utils/dateUtils';
import PostCard from '../../components/Feed/PostCard';
import type { Post, Comment } from '../../types/post';
import { formatDistanceToNow } from 'date-fns';
import './PostDetailPage.css';

const PostDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPostAndComments = useCallback(async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const [postRes, commentsRes] = await Promise.all([
        postService.getPost(Number(postId)),
        commentService.getComments(Number(postId)),
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data || []);
    } catch (error) {
      addToast('Failed to load post details', 'error');
    } finally {
      setLoading(false);
    }
  }, [postId, addToast]);

  useEffect(() => {
    fetchPostAndComments();
  }, [fetchPostAndComments]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || isSubmitting || !postId) return;

    setIsSubmitting(true);
    try {
      await commentService.addComment(Number(postId), replyContent);
      setReplyContent('');
      fetchPostAndComments();
    } catch (error) {
      addToast('Failed to submit reply', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="home-feed">
        <div className="feed-header"><h2>Post</h2></div>
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
          <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <h2>Post not found</h2>
        </div>
        <div className="empty-feed"><p>This post may have been deleted.</p></div>
      </div>
    );
  }

  return (
    <div className="home-feed">
      <div className="feed-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <h2>Post</h2>
        </div>
      </div>

      <div className="post-detail-main">
        <PostCard post={post} onUpdate={fetchPostAndComments} onNavigateToPost={() => {}} />
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
              <div className="comment-avatar" onClick={() => navigate(`/profile/${comment.author.username}`)} style={{ cursor: 'pointer' }}>
                {comment.author.username.charAt(0).toUpperCase()}
              </div>
              <div className="comment-content-wrapper">
                <div className="comment-header-row">
                  <span className="comment-author-name" onClick={() => navigate(`/profile/${comment.author.username}`)} style={{ cursor: 'pointer' }}>@{comment.author.username}</span>
                  <span className="comment-time">{formatDistanceToNow(new Date(ensureUtc(comment.createdAt)), { addSuffix: true })}</span>
                </div>
                <p className="comment-text">
                  {renderContentWithMentions(comment.content).map((part, index) => {
                    if (part.isMention) {
                      const username = part.text.substring(1);
                      return (
                        <span
                          key={index}
                          className="mention-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${username}`);
                          }}
                          style={{ color: 'var(--primary)', cursor: 'pointer', position: 'relative', zIndex: 10 }}
                        >
                          {part.text}
                        </span>
                      );
                    }
                    return part.text;
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;
