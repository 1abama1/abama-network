import { useState, useRef } from 'react';
import { Smile, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import EmojiPicker from '../Common/EmojiPicker';
import { AnimatePresence } from 'framer-motion';
import './Feed.css';

const CreatePost = ({ onPostCreated, onOptimisticPost }: {
  onPostCreated: () => void,
  onOptimisticPost?: (content: string) => void
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  const handlePost = async () => {
    if (!content.trim()) return;

    if (onOptimisticPost) onOptimisticPost(content);

    setLoading(true);
    const originalContent = content;
    setContent('');
    try {
      await axiosInstance.post('/posts', { content: originalContent });
      onPostCreated();
    } catch (error) {
      console.error('Failed to create post', error);
      setContent(originalContent);
      alert("Failed to send post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + emoji + content.substring(end);

    setContent(newContent);

    // Set focus back and move cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  return (
    <div className="create-post-container glass">
      <div className="avatar-placeholder">
        {user?.username?.charAt(0).toUpperCase()}
      </div>
      <div className="post-input-wrapper">
        <textarea
          ref={textareaRef}
          placeholder="What's happening on the court?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <div className="post-actions">
          <div className="tool-icons" style={{ position: 'relative' }}>
            {/* <button className="tool-btn"><Image size={18} /></button> */}
            {/* <button className="tool-btn"><MapPin size={18} /></button> */}
            <button
              className={`tool-btn ${showEmojiPicker ? 'active' : ''}`}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile size={18} />
            </button>

            <AnimatePresence>
              {showEmojiPicker && (
                <EmojiPicker
                  onSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </AnimatePresence>
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
