import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { postService } from '../../api/services/postService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Common/Toast';
import CreatePost from '../../components/Feed/CreatePost';
import PostCard from '../../components/Feed/PostCard';
import type { Post } from '../../types/post';
import '../../components/Feed/Feed.css';

const HomeFeed = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await postService.getFeed();
      setPosts(response.data.content || []);
    } catch (error) {
      addToast('Failed to load feed', 'error');
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="home-feed">
      <div className="page-header">
        <h2>Home</h2>
        <button
          className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={() => fetchPosts(true)}
          disabled={refreshing}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="feed-content">
        <CreatePost
          onPostCreated={() => fetchPosts(true)}
          onOptimisticPost={(content) => {
            const tempPost: Post = {
              id: -Date.now(),
              author: {
                id: 0,
                username: user?.username || 'Unknown',
                positions: null,
                height: null,
                followersCount: 0,
                bio: null,
              },
              content,
              createdAt: new Date().toISOString(),
              likesCount: 0,
              commentsCount: 0,
              repostsCount: 0,
              isLiked: false,
              isReposted: false,
              originalPost: null,
              caption: null,
            };
            setPosts(prev => [tempPost, ...prev]);
          }}
        />

        <div className="posts-list">
          <AnimatePresence>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={() => fetchPosts(true)}
              />
            ))}
          </AnimatePresence>

          {loading && (
            <div className="feed-loading">
              <div className="basketball-spinner" />
              <p>Fetching the latest plays...</p>
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="empty-feed">
              <h3>The court is empty...</h3>
              <p>Follow some players to see their highlights!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeFeed;
