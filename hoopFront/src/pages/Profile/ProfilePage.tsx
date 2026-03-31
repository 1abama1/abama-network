import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Edit2, Award, UserPlus, UserMinus } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import PostCard from '../../components/Feed/PostCard';
import StatRing from '../../components/Profile/StatRing';
import EditProfileModal from '../../components/Profile/EditProfileModal';
import '../../components/Profile/Profile.css';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Profile Data (Critical)
      const profileRes = await axiosInstance.get(`/users/profile/${username}`);
      setProfile(profileRes.data);
      
      // 2. Fetch Posts Data (Non-critical)
      try {
        const postsRes = await axiosInstance.get(`/posts/user/${username}`);
        setPosts(postsRes.data.content || []);
      } catch (postError) {
        console.error('Failed to fetch user posts', postError);
        setPosts([]); // Gracefully handle missing posts
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const handleFollow = async () => {
    if (isActionLoading || !profile) return;
    
    // OPTIMISTIC UPDATE
    const wasFollowing = profile.isFollowing;
    const oldFollowersCount = profile.followersCount;
    
    setProfile((prev: any) => ({
      ...prev,
      isFollowing: !wasFollowing,
      followersCount: wasFollowing ? oldFollowersCount - 1 : oldFollowersCount + 1
    }));
    
    setIsActionLoading(true);
    try {
      if (wasFollowing) {
        await axiosInstance.delete(`/users/unfollow/${username}`);
      } else {
        await axiosInstance.post(`/users/follow/${username}`);
      }
      // Silently sync with backend to ensure consistency
      fetchProfileData(); 
    } catch (error) {
      // ROLLBACK on failure
      setProfile((prev: any) => ({
        ...prev,
        isFollowing: wasFollowing,
        followersCount: oldFollowersCount
      }));
      console.error('Follow action failed', error);
      alert("Failed to update follow status. Please try again.");
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    if (username) fetchProfileData();
  }, [username, fetchProfileData]);

  const handleProfileUpdate = (updatedProfile: any) => {
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
                <>
                  <UserMinus size={18} />
                  <span>Unfollow</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="profile-names">
          <h2>{profile?.displayName || profile?.username || username || 'Baller'}</h2>
          <span className="profile-handle">@{profile?.username || username}</span>
        </div>

        <p className="profile-bio">
          {profile?.bio || (isOwnProfile ? "You haven't added a bio yet. Tell the court who you are!" : "This baller hasn't added a bio yet.")}
        </p>

        <div className="player-stats-grid glass">
          <StatRing 
            label="Height" 
            value={profile?.height || 0} 
            unit="cm" 
            percent={profile?.height ? Math.min(100, (profile.height / 230) * 100) : 0} 
            color="#FF6B00"
          />
          <StatRing 
            label="Weight" 
            value={profile?.weight || 0} 
            unit="kg" 
            percent={profile?.weight ? Math.min(100, (profile.weight / 150) * 100) : 0} 
            color="#FF8A00"
          />
          <StatRing 
            label="Vert" 
            value={profile?.jump || 0} 
            unit="in" 
            percent={profile?.jump ? Math.min(100, (profile.jump / 50) * 100) : 0} 
            color="#FFB800"
          />
          <div className="stat-summary">
            <div className="stat-item">
              <Award size={20} color="var(--primary)" />
              <span>{profile?.positions?.length > 0 ? profile.positions.join(', ').replace(/_/g, ' ') : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="profile-stats-meta">
          <span><strong>{profile?.followingCount || 0}</strong> Following</span>
          <span style={{ marginLeft: '1rem' }}><strong>{profile?.followersCount || 0}</strong> Followers</span>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button 
          className={`tab ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          Media
        </button>
        <button 
          className={`tab ${activeTab === 'likes' ? 'active' : ''}`}
          onClick={() => setActiveTab('likes')}
        >
          Likes
        </button>
      </div>

      <div className="profile-posts">
        <AnimatePresence mode="popLayout">
          {activeTab === 'posts' && posts.map((post: any) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onUpdate={fetchProfileData} 
            />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isEditModalOpen && (
          <EditProfileModal 
            profile={profile} 
            onClose={() => setIsEditModalOpen(false)} 
            onSave={handleProfileUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
