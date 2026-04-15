import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Calendar, MapPin, Users, Type, FileText, Save, Trophy,
} from 'lucide-react';
import { gameService } from '../../api/services/gameService';
import type { Game } from '../../types/game';
import { useToast } from '../../components/Common/Toast';
import './CreateGameModal.css';

interface CreateGameModalProps {
  onClose: () => void;
  onGameCreated: () => void;
  editGame?: Game;
}

interface GameFormData {
  title: string;
  description: string;
  location: string;
  dateTime: string;
  minPlayers: number;
  maxPlayers: number;
}

const CreateGameModal = ({ onClose, onGameCreated, editGame }: CreateGameModalProps) => {
  const [formData, setFormData] = useState<GameFormData>({
    title: editGame?.title || '',
    description: editGame?.description || '',
    location: editGame?.location || '',
    dateTime: editGame?.dateTime ? editGame.dateTime.split('.')[0] : '',
    minPlayers: editGame?.minPlayers || 2,
    maxPlayers: editGame?.maxPlayers || 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const validate = (): boolean => {
    if (!formData.title.trim()) { setError('Game title is required.'); return false; }
    if (!formData.location.trim()) { setError('Location is required.'); return false; }
    if (!formData.dateTime) { setError('Date and time are required.'); return false; }
    if (formData.minPlayers < 2) { setError('Minimum players must be at least 2.'); return false; }
    if (formData.maxPlayers < formData.minPlayers) { setError('Max players must be at least min players.'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');

    try {
      if (editGame) {
        await gameService.updateGame(editGame.id, formData);
        addToast('Game updated successfully!', 'success');
      } else {
        await gameService.createGame(formData);
        addToast('Game scheduled successfully!', 'success');
      }
      onGameCreated();
      onClose();
    } catch (err: unknown) {
      let message = `Failed to ${editGame ? 'update' : 'create'} game`;
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        message = axiosErr.response?.data?.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const update = (patch: Partial<GameFormData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  return (
    <div className="cg-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="cg-modal glass"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cg-header">
          <div className="cg-header-left">
            <div className="cg-header-icon">
              <Trophy size={20} />
            </div>
            <h3>{editGame ? 'Edit Game' : 'Schedule a Run'}</h3>
          </div>
          <button className="cg-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cg-form">
          {error && <div className="cg-error">{error}</div>}

          <div className="cg-field">
            <label><Type size={14} /> Game Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="e.g. 5v5 Full-court Run"
              required
            />
          </div>

          <div className="cg-field">
            <label><MapPin size={14} /> Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => update({ location: e.target.value })}
              placeholder="Court name or address..."
              required
            />
          </div>

          <div className="cg-row-3">
            <div className="cg-field">
              <label><Calendar size={14} /> Date & Time</label>
              <input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => update({ dateTime: e.target.value })}
                required
              />
            </div>
            <div className="cg-field">
              <label><Users size={14} /> Min</label>
              <input
                type="number"
                value={formData.minPlayers}
                min={2}
                onChange={(e) => update({ minPlayers: parseInt(e.target.value) || 2 })}
              />
            </div>
            <div className="cg-field">
              <label><Users size={14} /> Max</label>
              <input
                type="number"
                value={formData.maxPlayers}
                min={2}
                onChange={(e) => update({ maxPlayers: parseInt(e.target.value) || 2 })}
              />
            </div>
          </div>

          <div className="cg-field">
            <label><FileText size={14} /> Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Tell players about the court, skill level, etc..."
            />
          </div>

          <div className="cg-actions">
            <button type="button" className="cg-btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="cg-btn-submit" disabled={loading}>
              {loading
                ? (editGame ? 'Updating...' : 'Scheduling...')
                : (
                  <>
                    <Save size={16} />
                    {editGame ? 'Save Changes' : 'Schedule Game'}
                  </>
                )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateGameModal;
