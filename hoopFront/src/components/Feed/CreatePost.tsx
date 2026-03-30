import { useState } from 'react';
import { Image, MapPin, Smile, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import './Feed.css';

const CreatePost = ({ onPostCreated, onOptimisticPost }: { 
  onPostCreated: () => void,
  onOptimisticPost?: (content: string) => void 
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handlePost = async () => {
    if (!content.trim()) return;
    
    // OPTIMISTIC UPDATE
    if (onOptimisticPost) onOptimisticPost(content);
    
    setLoading(true);
    const originalContent = content;
    setContent(''); // Clear instantly
    try {
      await axiosInstance.post('/posts', { content: originalContent });
      onPostCreated();
    } catch (error) {
      console.error('Failed to create post', error);
      // ROLLBACK: Restore content if failed so user can try again
      setContent(originalContent);
      alert("Failed to send post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container glass">
      <div className="avatar-placeholder">
        {user?.username?.charAt(0).toUpperCase()}
      </div>
      <div className="post-input-wrapper">
        <textarea 
          placeholder="What's happening on the court?" 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <div className="post-actions">
          <div className="tool-icons">
            <button className="tool-btn"><Image size={18} /></button>
            <button className="tool-btn"><MapPin size={18} /></button>
            <button className="tool-btn"><Smile size={18} /></button>
          </div>
          <button 
            className="btn-primary post-btn" 
            onClick={handlePost}
            disabled={loading || !content.trim()}
          >
            {loading ? 'Posting...' : <><Send size={16} /> Post</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
