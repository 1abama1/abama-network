import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import CreatePost from '../../components/Feed/CreatePost';
import PostCard from '../../components/Feed/PostCard';
import '../../components/Feed/Feed.css';

const HomeFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await axiosInstance.get('/posts/feed');
      setPosts(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch feed', error);
      setPosts([]); // Clear posts on error to avoid showing stale mocks
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="home-feed">
      <div className="feed-header glass">
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
            const tempPost = {
              id: -Date.now(),
              content,
              createdAt: new Date().toISOString(),
              author: { username: user?.username || 'Unknown', displayName: user?.username || 'Unknown' },
              likesCount: 0,
              commentsCount: 0,
              repostsCount: 0,
              isLiked: false,
              isReposted: false
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
