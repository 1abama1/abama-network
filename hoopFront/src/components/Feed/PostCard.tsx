import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Repeat, Share, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import ShareMenu from '../Common/ShareMenu';
import './Feed.css';

interface PostProps {
  post: {
    id: number;
    content: string;
    createdAt: string;
    author: {
      username: string;
      displayName?: string;
      avatarUrl?: string;
    };
    likesCount: number;
    commentsCount: number;
    repostsCount: number;
    isLiked: boolean;
    isReposted: boolean;
    originalPost?: any;
    repostCaption?: string;
  };
  onUpdate: () => void;
  onNavigateToPost?: (postId: number) => void;
}

const PostCard = ({ post, onUpdate, onNavigateToPost }: PostProps) => {
  const navigate = useNavigate();
  // Optimistic UI State
  const [localLiked, setLocalLiked] = useState(post.isLiked);
  const [localLikeCount, setLocalLikeCount] = useState(post.likesCount);
  const [localReposted, setLocalReposted] = useState(post.isReposted);
  const [localRepostCount, setLocalRepostCount] = useState(post.repostsCount);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    setLocalLiked(post.isLiked);
    setLocalLikeCount(post.likesCount);
    setLocalReposted(post.isReposted);
    setLocalRepostCount(post.repostsCount);
  }, [post]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSyncing) return;

    // OPTIMISTIC UPDATE
    const wasLiked = localLiked;
    const newCount = wasLiked ? localLikeCount - 1 : localLikeCount + 1;

    setLocalLiked(!wasLiked);
    setLocalLikeCount(newCount);
    setIsSyncing(true);

    try {
      if (wasLiked) {
        await axiosInstance.delete(`/posts/${post.id}/like`);
      } else {
        await axiosInstance.post(`/posts/${post.id}/like`);
      }
      // Silently sync with parent if needed, but UI is already updated
      // onUpdate(); 
    } catch (error) {
      // ROLLBACK on failure
      setLocalLiked(wasLiked);
      setLocalLikeCount(localLikeCount);
      console.error('Failed to toggle like', error);
      alert("Failed to like post. Check your connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSyncing) return;
    if (localReposted) {
      alert("You have already reposted this.");
      return;
    }

    const confirmRepost = window.confirm("Do you want to repost this to your feed?");
    if (!confirmRepost) return;

    // OPTIMISTIC UPDATE
    const wasReposted = localReposted;
    setLocalReposted(true);
    setLocalRepostCount(localRepostCount + 1);
    setIsSyncing(true);

    try {
      await axiosInstance.post(`/posts/${post.id}/repost`, {});
      onUpdate(); // For reposts, we want the whole feed to refresh to show the new item
    } catch (error) {
      // ROLLBACK on failure
      setLocalReposted(wasReposted);
      setLocalRepostCount(localRepostCount);
      console.error('Failed to repost', error);
      alert("Failed to repost. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

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

  const renderContentWithMentions = (content: string) => {
    if (!content) return null;
    const parts = content.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.substring(1);
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
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <>
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
          <div className="post-avatar" onClick={(e) => handleProfileClick(e, post.originalPost ? post.originalPost.author.username : post.author.username)} style={{ cursor: 'pointer' }}>
            <div className="avatar-placeholder">
              {(post.originalPost ? post.originalPost.author.username : post.author.username).charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="post-content-container">
            <div className="post-user-info">
              <span className="post-user-name" onClick={(e) => handleProfileClick(e, post.originalPost ? post.originalPost.author.username : post.author.username)} style={{ cursor: 'pointer' }}>
                {post.originalPost ? post.originalPost.author.displayName || post.originalPost.author.username : post.author.displayName || post.author.username}
              </span>
              <span className="post-user-handle" onClick={(e) => handleProfileClick(e, post.originalPost ? post.originalPost.author.username : post.author.username)} style={{ cursor: 'pointer' }}>
                @{post.originalPost ? post.originalPost.author.username : post.author.username}
              </span>
              {/* <span className="dot">·</span> */}
              <span className="post-time">
                {(() => {
                  const rawDate = post.originalPost ? post.originalPost.createdAt : post.createdAt;
                  const dateStr = rawDate.endsWith('Z') ? rawDate : rawDate + 'Z';
                  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
                })()}
              </span>
              <button className="post-options-btn"><MoreHorizontal size={18} /></button>
            </div>

            <p className="post-text">
              {renderContentWithMentions(post.originalPost ? post.originalPost.content : post.content)}
            </p>

            {post.repostCaption && (
              <div className="quote-caption">
                {post.repostCaption}
              </div>
            )}

            <div className="post-interactions">
              <button
                className="interaction-btn comment-btn"
                onClick={handleCardClick}
              >
                <MessageCircle size={18} />
                <span>{post.originalPost ? post.originalPost.commentsCount : post.commentsCount}</span>
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
                title={`Check out this post by @${post.originalPost ? post.originalPost.author.username : post.author.username}`}
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
