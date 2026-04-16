import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Repeat, Share, MoreHorizontal, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { likeService } from '../../api/services/likeService';
import { postService } from '../../api/services/postService';
import { repostService } from '../../api/services/repostService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Common/Toast';
import { useConfirmDialog, ConfirmDialog } from '../Common/ConfirmDialog';
import { renderContentWithMentions } from '../../utils/renderContentWithMentions';
import { ensureUtc } from '../../utils/dateUtils';
import ShareMenu from '../Common/ShareMenu';
import type { Post } from '../../types/post';
import './Feed.css';

interface PostProps {
  post: Post;
  onUpdate: () => void;
  onNavigateToPost?: (postId: number) => void;
}

const PostCard = ({ post, onUpdate, onNavigateToPost }: PostProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { confirm, dialogProps } = useConfirmDialog();
  const [showOptions, setShowOptions] = useState(false);
  const [localLiked, setLocalLiked] = useState(post.isLiked);
  const [localLikeCount, setLocalLikeCount] = useState(post.likesCount);
  const [localReposted, setLocalReposted] = useState(post.isReposted);
  const [localRepostCount, setLocalRepostCount] = useState(post.repostsCount);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setLocalLiked(post.isLiked);
    setLocalLikeCount(post.likesCount);
    setLocalReposted(post.isReposted);
    setLocalRepostCount(post.repostsCount);
  }, [post]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSyncing) return;

    const wasLiked = localLiked;
    const newCount = wasLiked ? localLikeCount - 1 : localLikeCount + 1;

    setLocalLiked(!wasLiked);
    setLocalLikeCount(newCount);
    setIsSyncing(true);

    try {
      if (wasLiked) {
        await likeService.unlikePost(post.id);
      } else {
        await likeService.likePost(post.id);
      }
    } catch (error) {
      setLocalLiked(wasLiked);
      setLocalLikeCount(localLikeCount);
      addToast('Failed to toggle like', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSyncing) return;
    if (localReposted) {
      addToast('You have already reposted this.', 'info');
      return;
    }

    const confirmed = await confirm('Repost', 'Do you want to repost this to your feed?');
    if (!confirmed) return;

    const wasReposted = localReposted;
    setLocalReposted(true);
    setLocalRepostCount(localRepostCount + 1);
    setIsSyncing(true);

    try {
      await repostService.repost(targetPostId);
      onUpdate();
    } catch (error) {
      setLocalReposted(wasReposted);
      setLocalRepostCount(localRepostCount);
      addToast('Failed to repost', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await confirm('Delete Post', 'Are you sure you want to delete this post?', { type: 'danger' });
    if (!confirmed) return;

    try {
      await postService.deletePost(post.id);
      onUpdate();
    } catch (error) {
      addToast('Failed to delete post', 'error');
    }
  };

  const isAuthor = user?.username === post.author.username;
  const targetPostId = post.originalPost ? post.originalPost.id : post.id;

  const handleCardClick = () => {
    if (onNavigateToPost) {
      onNavigateToPost(targetPostId);
    } else {
      navigate(`/post/${targetPostId}`);
    }
  };

  const handleProfileClick = (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    navigate(`/profile/${username}`);
  };

  const renderMentionParts = (content: string) => {
    const parts = renderContentWithMentions(content);
    return parts.map((part, index) => {
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
    });
  };

  const displayAuthor = post.originalPost ? post.originalPost.author : post.author;
  const displayContent = post.originalPost ? post.originalPost.content : post.content;
  const displayCreatedAt = post.originalPost ? post.originalPost.createdAt : post.createdAt;
  const displayCommentsCount = post.originalPost ? post.originalPost.commentsCount : post.commentsCount;

  return (
    <>
      <ConfirmDialog {...dialogProps} />
      <motion.div
        className={`post-card ${post.originalPost ? 'is-repost' : ''}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        layout
        onClick={handleCardClick}
      >
        {post.originalPost && (
          <div className="repost-indicator">
            <Repeat size={14} />
            <span>{post.author.username} reposted</span>
          </div>
        )}

        <div className="post-main-content">
          <div className="post-avatar" onClick={(e) => handleProfileClick(e, displayAuthor.username)} style={{ cursor: 'pointer' }}>
            <div className="avatar-placeholder">
              {displayAuthor.username.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="post-content-container">
            <div className="post-user-info">
              <span className="post-user-name" onClick={(e) => handleProfileClick(e, displayAuthor.username)} style={{ cursor: 'pointer' }}>
                {displayAuthor.username}
              </span>
              <span className="post-user-handle" onClick={(e) => handleProfileClick(e, displayAuthor.username)} style={{ cursor: 'pointer' }}>
                @{displayAuthor.username}
              </span>
              <span className="post-time">
                {formatDistanceToNow(new Date(ensureUtc(displayCreatedAt)), { addSuffix: true })}
              </span>
              <div className="post-options-container">
                <button
                  className="post-options-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                  }}
                >
                  <MoreHorizontal size={18} />
                </button>
                <AnimatePresence>
                  {showOptions && isAuthor && (
                    <motion.div
                      className="post-options-dropdown glass"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <button className="dropdown-item delete-item" onClick={handleDelete}>
                        <Trash2 size={16} />
                        <span>Delete Post</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <p className="post-text">
              {renderMentionParts(displayContent)}
            </p>

            {post.caption && (
              <div className="quote-caption">
                {post.caption}
              </div>
            )}

            <div className="post-interactions">
              <button
                className="interaction-btn comment-btn"
                onClick={handleCardClick}
              >
                <MessageCircle size={18} />
                <span>{displayCommentsCount}</span>
              </button>

              <button
                className={`interaction-btn repost-btn ${localReposted ? 'active' : ''}`}
                onClick={handleRepost}
              >
                <Repeat size={18} />
                <span>{localRepostCount}</span>
              </button>

              <button
                className={`interaction-btn like-btn ${localLiked ? 'active' : ''}`}
                onClick={handleLike}
              >
                <motion.div
                  animate={localLiked ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <Heart size={18} fill={localLiked ? "#f91880" : "none"} stroke={localLiked ? "#f91880" : "currentColor"} />
                </motion.div>
                <span>{localLikeCount}</span>
              </button>

              <ShareMenu
                url={`/post/${targetPostId}`}
                title={`Check out this post by @${displayAuthor.username}`}
              >
                <button className="interaction-btn share-btn">
                  <Share size={18} />
                </button>
              </ShareMenu>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default PostCard;
