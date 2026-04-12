import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Edit2, Award, UserPlus, UserMinus, Lock, Gamepad2, Calendar } from 'lucide-react';
import { userService } from '../../api/services/userService';
import { postService } from '../../api/services/postService';
import { gameService } from '../../api/services/gameService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Common/Toast';
import PostCard from '../../components/Feed/PostCard';
import GameCard from '../../components/Games/GameCard';
import StatRing from '../../components/Profile/StatRing';
import EditProfileModal from '../../components/Profile/EditProfileModal';
import type { Profile } from '../../types/user';
import type { Post } from '../../types/post';
import type { Game } from '../../types/game';
import '../../components/Profile/Profile.css';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [gamesLoaded, setGamesLoaded] = useState(false);
  const [likesLoaded, setLikesLoaded] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  const fetchProfileData = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const profileRes = await userService.getProfile(username);
      setProfile(profileRes.data);

      try {
        const postsRes = await postService.getUserPosts(username);
        setPosts(postsRes.data.content || []);
      } catch (postError) {
        setPosts([]);
      }
    } catch (error) {
      addToast('Failed to fetch profile', 'error');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [username, addToast]);

  const fetchGames = useCallback(async () => {
    if (gamesLoaded || !username) return;
    try {
      const res = await gameService.getUserGames(username);
      setGames(res.data || []);
      setGamesLoaded(true);
    } catch (error) {
      addToast('Failed to fetch games', 'error');
      setGames([]);
    }
  }, [username, gamesLoaded, addToast]);

  const fetchLikedPosts = useCallback(async () => {
    if (likesLoaded || !username) return;
    try {
      const res = await postService.getLikedPosts(username);
      setLikedPosts(res.data.content || []);
      setLikesLoaded(true);
    } catch (error) {
      addToast('Failed to fetch liked posts', 'error');
      setLikedPosts([]);
    }
  }, [username, likesLoaded, addToast]);

  const handleGameRegister = async (gameId: string | number) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    try {
      if (game.isRegistered) {
        await gameService.unregisterFromGame(Number(gameId));
      } else {
        await gameService.registerForGame(Number(gameId));
      }
      setGamesLoaded(false);
      fetchGames();
    } catch (error) {
      addToast('Game registration failed', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'games') {
      fetchGames();
    } else if (activeTab === 'likes') {
      fetchLikedPosts();
    }
  }, [activeTab, fetchGames, fetchLikedPosts]);

  const handleFollow = async () => {
    if (isActionLoading || !profile) return;

    const wasFollowing = profile.isFollowing;
    const oldFollowersCount = profile.followersCount;

    setProfile(prev => prev ? {
      ...prev,
      isFollowing: !wasFollowing,
      followersCount: wasFollowing ? oldFollowersCount - 1 : oldFollowersCount + 1
    } : prev);

    setIsActionLoading(true);
    try {
      if (wasFollowing) {
        await userService.unfollow(username!);
      } else {
        await userService.follow(username!);
      }
      fetchProfileData();
    } catch (error) {
      setProfile(prev => prev ? {
        ...prev,
        isFollowing: wasFollowing,
        followersCount: oldFollowersCount
      } : prev);
      addToast('Failed to update follow status', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfileData();
      setGamesLoaded(false);
      setLikesLoaded(false);
      setActiveTab('posts');
    }
  }, [username, fetchProfileData]);

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  if (loading) return <div className="feed-loading"><div className="basketball-spinner" /></div>;

  return (
    <div className="profile-container">
      <div className="profile-header" />

      <div className="profile-info-section">
        <div className="profile-actions-row">
          <div className="avatar-large">
            {profile?.username?.charAt(0).toUpperCase()}
          </div>
          {isOwnProfile ? (
            <button className="btn-outline" onClick={() => setIsEditModalOpen(true)}>
              <Edit2 size={18} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              className={`btn-${profile?.isFollowing ? 'outline' : 'primary'}`}
              onClick={handleFollow}
              disabled={isActionLoading}
            >
              {profile?.isFollowing ? (
                <><UserMinus size={18} /><span>Unfollow</span></>
              ) : (
                <><UserPlus size={18} /><span>Follow</span></>
              )}
            </button>
          )}
        </div>

        <div className="profile-names">
          <h2>{profile?.username || username || 'Baller'}</h2>
          <span className="profile-handle">@{profile?.username || username}</span>
        </div>

        <p className="profile-bio">
          {profile?.bio || (isOwnProfile ? "You haven't added a bio yet. Tell the court who you are!" : "This baller hasn't added a bio yet.")}
        </p>

        <div className="player-stats-grid glass">
          <StatRing label="Height" value={profile?.height || 0} unit="cm" percent={profile?.height ? Math.min(100, (profile.height / 230) * 100) : 0} color="#FF6B00" />
          <StatRing label="Weight" value={profile?.weight || 0} unit="kg" percent={profile?.weight ? Math.min(100, (profile.weight / 150) * 100) : 0} color="#FF8A00" />
          <StatRing label="Vert" value={profile?.jump || 0} unit="in" percent={profile?.jump ? Math.min(100, (profile.jump / 50) * 100) : 0} color="#FFB800" />
          <div className="stat-summary">
            <div className="stat-item">
              <Award size={20} color="var(--primary)" />
              <span>{(profile?.positions?.length ?? 0) > 0 ? profile!.positions!.join(', ').replace(/_/g, ' ') : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="profile-stats-meta">
          <span><strong>{profile?.followingCount || 0}</strong> Following</span>
          <span style={{ marginLeft: '1rem' }}><strong>{profile?.followersCount || 0}</strong> Followers</span>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Posts</button>
        <button className={`tab ${activeTab === 'games' ? 'active' : ''}`} onClick={() => setActiveTab('games')}>
          <Gamepad2 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Games
        </button>
        {isOwnProfile && (
          <button className={`tab ${activeTab === 'likes' ? 'active' : ''}`} onClick={() => setActiveTab('likes')}>
            <Lock size={14} style={{ marginRight: '6px', verticalAlign: 'middle', opacity: 0.6 }} />Likes
          </button>
        )}
      </div>

      <div className="profile-posts">
        <AnimatePresence mode="popLayout">
          {activeTab === 'posts' && posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={fetchProfileData} />
          ))}
          {activeTab === 'posts' && posts.length === 0 && (
            <motion.div className="empty-tab-state" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><p>No posts yet</p></motion.div>
          )}

          {activeTab === 'games' && games.map((game) => (
            <GameCard key={game.id} game={game} onRegister={handleGameRegister} />
          ))}
          {activeTab === 'games' && games.length === 0 && gamesLoaded && (
            <motion.div className="empty-tab-state" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>{isOwnProfile ? "You haven't joined any games yet" : "This baller hasn't joined any games yet"}</p>
            </motion.div>
          )}

          {activeTab === 'likes' && likedPosts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={() => { setLikesLoaded(false); fetchLikedPosts(); }} />
          ))}
          {activeTab === 'likes' && likedPosts.length === 0 && likesLoaded && (
            <motion.div className="empty-tab-state" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><p>No liked posts yet</p></motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isEditModalOpen && profile && (
          <EditProfileModal profile={profile} onClose={() => setIsEditModalOpen(false)} onSave={handleProfileUpdate} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
