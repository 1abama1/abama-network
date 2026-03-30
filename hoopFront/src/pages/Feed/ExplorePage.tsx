import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { RefreshCw, TrendingUp } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';
import PostCardFeed from '../../components/Feed/PostCard'; 
import CreatePost from '../../components/Feed/CreatePost';
import '../../components/Feed/Feed.css';

const ExplorePage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchExploreFeed = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/posts/explore');
      setPosts(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch explore feed', error);
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExploreFeed();
  }, [fetchExploreFeed]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchExploreFeed();
  };

  return (
    <div className="feed-container">
      <div className="feed-header">
        <div className="header-title">
          <h2>Explore</h2>
          <p>Discover ballers and courts around the globe</p>
        </div>
        <button 
          className={`refresh-btn ${refreshing ? 'spinning' : ''}`} 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="explore-hero glass">
        <TrendingUp size={24} color="var(--primary)" />
        <div className="hero-text">
          <h3>Trending on the Blacktop</h3>
          <p>Check out the most hyped runs and highlights.</p>
        </div>
      </div>

      <CreatePost 
        onPostCreated={handleRefresh} 
        onOptimisticPost={(content) => {
          const tempPost = {
            id: -Date.now(),
            content,
            createdAt: new Date().toISOString(),
            author: { username: 'me', displayName: 'Me' },
            likesCount: 0,
            commentsCount: 0,
            repostsCount: 0,
            isLiked: false,
            isReposted: false
          };
          setPosts(prev => [tempPost, ...prev]);
        }}
      />

      {loading ? (
        <div className="feed-loading">
          <div className="basketball-spinner" />
          <p>Scouting the world...</p>
        </div>
      ) : (
        <div className="posts-list">
          <AnimatePresence mode="popLayout">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCardFeed 
                  key={post.id} 
                  post={post} 
                  onUpdate={fetchExploreFeed} 
                />
              ))
            ) : (
              <div className="empty-state">
                <p>The court is empty worldwide... Be the first to start a run!</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
