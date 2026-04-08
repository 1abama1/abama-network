import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, MapPin, Users, Info, Save } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';

interface CreateGameModalProps {
  onClose: () => void;
  onGameCreated: () => void;
  editGame?: any; // Added for editing
}

const CreateGameModal = ({ onClose, onGameCreated, editGame }: CreateGameModalProps) => {
  const [formData, setFormData] = useState({
    title: editGame?.title || '',
    description: editGame?.description || '',
    location: editGame?.location || '',
    dateTime: editGame?.dateTime ? editGame.dateTime.split('.')[0] : '', // Format for datetime-local
    minPlayers: editGame?.minPlayers || 2,
    maxPlayers: editGame?.maxPlayers || 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editGame) {
        await axiosInstance.put(`/games/${editGame.id}`, formData);
      } else {
        await axiosInstance.post('/games', formData);
      }
      onGameCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${editGame ? 'update' : 'create'} game`);
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
        style={{ maxWidth: '600px' }}
      >
        <div className="modal-header">
          <h3>{editGame ? 'Edit Game Intel' : 'Schedule a Run'}</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <label><Info size={14} /> Game Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 5v5 Full-court Run"
              required
            />
          </div>

          <div className="form-section">
            <label><MapPin size={14} /> Location</label>
            <input 
              type="text" 
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter court name/address..."
              required
            />
          </div>

          <div className="stats-edit-grid">
            <div className="form-group">
              <label><Calendar size={14} /> Date & Time</label>
              <input 
                type="datetime-local" 
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label><Users size={14} /> Min Players</label>
              <input 
                type="number" 
                value={formData.minPlayers}
                min={2}
                onChange={(e) => setFormData({ ...formData, minPlayers: parseInt(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label><Users size={14} /> Max Players</label>
              <input 
                type="number" 
                value={formData.maxPlayers}
                min={2}
                onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-section">
            <label>Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell players about the court, level of play, etc..."
              style={{ minHeight: '100px' }}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (editGame ? 'Updating...' : 'Scheduling...') : <><Save size={18} /> {editGame ? 'Save Changes' : 'Schedule Game'}</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateGameModal;
