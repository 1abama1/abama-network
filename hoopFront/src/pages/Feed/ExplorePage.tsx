import { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, TrendingUp, Users, FileText, X, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import PostCardFeed from '../../components/Feed/PostCard';
import '../../components/Feed/Feed.css';
import './ExplorePage.css';

type Tab = 'trending' | 'people' | 'posts';

interface UserSummary {
  id: number;
  username: string;
  positions: string[];
  height: number;
  followersCount: number;
}

const ExplorePage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('trending');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Trending feed state
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  // People search state
  const [people, setPeople] = useState<UserSummary[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());

  // Posts search state
  const [postResults, setPostResults] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  // When query becomes non-empty, auto-switch to people tab
  useEffect(() => {
    if (debouncedQuery && tab === 'trending') {
      setTab('people');
    }
    if (!debouncedQuery) {
      setTab('trending');
    }
  }, [debouncedQuery]);

  // Fetch trending/explore feed
  const fetchTrending = useCallback(async () => {
    setTrendingLoading(true);
    try {
      const res = await axiosInstance.get('/posts/explore');
      setTrendingPosts(res.data.content || []);
    } catch {
      setTrendingPosts([]);
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  // Search people
  useEffect(() => {
    if (!debouncedQuery) {
      setPeople([]);
      return;
    }
    setPeopleLoading(true);
    axiosInstance
      .get('/users/search', { params: { q: debouncedQuery } })
      .then((res) => setPeople(res.data || []))
      .catch(() => setPeople([]))
      .finally(() => setPeopleLoading(false));
  }, [debouncedQuery]);

  // Search posts
  useEffect(() => {
    if (!debouncedQuery) {
      setPostResults([]);
      return;
    }
    if (tab !== 'posts') return;
    setPostsLoading(true);
    axiosInstance
      .get('/posts/search', { params: { q: debouncedQuery } })
      .then((res) => setPostResults(res.data.content || []))
      .catch(() => setPostResults([]))
      .finally(() => setPostsLoading(false));
  }, [debouncedQuery, tab]);

  const handleFollow = async (username: string) => {
    try {
      if (followingSet.has(username)) {
        await axiosInstance.delete(`/users/unfollow/${username}`);
        setFollowingSet((prev) => {
          const next = new Set(prev);
          next.delete(username);
          return next;
        });
      } else {
        await axiosInstance.post(`/users/follow/${username}`);
        setFollowingSet((prev) => new Set(prev).add(username));
      }
    } catch (e) {
      console.error('Follow action failed', e);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
    { key: 'trending', label: 'Trending', icon: <TrendingUp size={16} /> },
    { key: 'people', label: 'People', icon: <Users size={16} />, disabled: !debouncedQuery },
    { key: 'posts', label: 'Posts', icon: <FileText size={16} />, disabled: !debouncedQuery },
  ];

  return (
    <div className="explore-page">
      {/* Sticky search header */}
      <div className="explore-search-header">
        <div className="explore-search-bar glass">
          <Search size={18} className="search-icon-prefix" />
          <input
            ref={inputRef}
            className="explore-search-input"
            type="text"
            placeholder="Search Hoop Network..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button
              className="search-clear-btn"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="explore-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`explore-tab ${tab === t.key ? 'active' : ''} ${t.disabled ? 'disabled' : ''}`}
              onClick={() => !t.disabled && setTab(t.key)}
              disabled={t.disabled}
            >
              {t.icon}
              <span>{t.label}</span>
              {tab === t.key && <motion.div className="explore-tab-indicator" layoutId="tab-indicator" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="explore-content">
        <AnimatePresence mode="wait">

          {/* ── TRENDING ── */}
          {tab === 'trending' && (
            <motion.div
              key="trending"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="explore-section-label">
                <TrendingUp size={15} />
                <span>Trending on the Blacktop</span>
              </div>
              {trendingLoading ? (
                <div className="feed-loading">
                  <div className="basketball-spinner" />
                  <p>Scouting the world...</p>
                </div>
              ) : trendingPosts.length === 0 ? (
                <div className="empty-state explore-empty">
                  <TrendingUp size={40} strokeWidth={1.2} />
                  <p>No runs yet. Be the first!</p>
                </div>
              ) : (
                <div className="posts-list">
                  {trendingPosts.map((post) => (
                    <PostCardFeed key={post.id} post={post} onUpdate={fetchTrending} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── PEOPLE ── */}
          {tab === 'people' && (
            <motion.div
              key="people"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="explore-section-label">
                <Users size={15} />
                <span>People matching "{debouncedQuery}"</span>
              </div>
              {peopleLoading ? (
                <div className="feed-loading">
                  <div className="basketball-spinner" />
                  <p>Searching ballers...</p>
                </div>
              ) : people.length === 0 ? (
                <div className="empty-state explore-empty">
                  <Users size={40} strokeWidth={1.2} />
                  <p>No players found for "{debouncedQuery}"</p>
                </div>
              ) : (
                <div className="people-list">
                  {people.map((user) => (
                    <motion.div
                      key={user.id}
                      className="people-card glass"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => navigate(`/profile/${user.username}`)}
                    >
                      <div className="people-avatar">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="people-info">
                        <span className="people-name">@{user.username}</span>
                        <div className="people-meta">
                          {user.positions?.length > 0 && (
                            <span className="people-tag">{user.positions.join(', ')}</span>
                          )}
                          {user.height && (
                            <span className="people-tag">{user.height} cm</span>
                          )}
                          <span className="people-followers">{user.followersCount} followers</span>
                        </div>
                      </div>
                      <button
                        className={`follow-btn ${followingSet.has(user.username) ? 'following' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollow(user.username);
                        }}
                      >
                        {followingSet.has(user.username) ? (
                          <><UserCheck size={14} /> Following</>
                        ) : (
                          'Follow'
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── POSTS ── */}
          {tab === 'posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="explore-section-label">
                <FileText size={15} />
                <span>Posts matching "{debouncedQuery}"</span>
              </div>
              {postsLoading ? (
                <div className="feed-loading">
                  <div className="basketball-spinner" />
                  <p>Searching posts...</p>
                </div>
              ) : postResults.length === 0 ? (
                <div className="empty-state explore-empty">
                  <FileText size={40} strokeWidth={1.2} />
                  <p>No posts found for "{debouncedQuery}"</p>
                </div>
              ) : (
                <div className="posts-list">
                  {postResults.map((post) => (
                    <PostCardFeed
                      key={post.id}
                      post={post}
                      onUpdate={() =>
                        axiosInstance
                          .get('/posts/search', { params: { q: debouncedQuery } })
                          .then((r) => setPostResults(r.data.content || []))
                      }
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExplorePage;
