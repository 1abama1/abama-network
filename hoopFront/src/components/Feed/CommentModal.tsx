import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { commentService } from '../../api/services/commentService';
import { useToast } from '../../components/Common/Toast';

interface CommentModalProps {
  postId: number;
  onClose: () => void;
  onCommentAdded: () => void;
}

const CommentModal = ({ postId, onClose, onCommentAdded }: CommentModalProps) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await commentService.addComment(postId, content);
      onCommentAdded();
      onClose();
    } catch (error) {
      console.error('Failed to add comment', error);
      addToast('Failed to add comment. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="modal-content glass"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '450px' }}
      >
        <div className="modal-header">
          <h3>Add Comment</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Post your reply..."
            autoFocus
            style={{ minHeight: '120px', fontSize: '1.1rem' }}
          />
          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={loading || !content.trim()}>
              {loading ? 'Posting...' : <><Send size={18} /> Reply</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CommentModal;
