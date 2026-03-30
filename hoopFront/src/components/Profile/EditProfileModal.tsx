import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Ruler, Weight, ArrowUpCircle } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';

interface EditProfileModalProps {
  profile: any;
  onClose: () => void;
  onSave: (updatedProfile: any) => void;
}

const POSITIONS = [
  'POINT_GUARD',
  'SHOOTING_GUARD',
  'SMALL_FORWARD',
  'POWER_FORWARD',
  'CENTER'
];

const EditProfileModal = ({ profile, onClose, onSave }: EditProfileModalProps) => {
  const [formData, setFormData] = useState({
    bio: profile?.bio || '',
    height: profile?.height || 180,
    weight: profile?.weight || 75,
    jump: profile?.jump || 30,
    positions: profile?.positions || []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePositionToggle = (pos: string) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.includes(pos)
        ? prev.positions.filter((p: string) => p !== pos)
        : [...prev.positions, pos]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submissionData = {
      ...formData,
      height: formData.height || 180,
      weight: formData.weight || 75,
      jump: formData.jump || 0,
      positions: formData.positions.length > 0 ? formData.positions : ['POINT_GUARD']
    };

    try {
      const response = await axiosInstance.put('/users/profile', submissionData);
      onSave(response.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="modal-content glass"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <label>Bio</label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell the court about yourself..."
              maxLength={500}
            />
          </div>

          <div className="stats-edit-grid">
            <div className="form-group">
              <label><Ruler size={14} /> Height (cm)</label>
              <input 
                type="number" 
                value={formData.height}
                min={140} max={250}
                onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label><Weight size={14} /> Weight (kg)</label>
              <input 
                type="number" 
                value={formData.weight}
                min={40} max={200}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label><ArrowUpCircle size={14} /> Vertical (in)</label>
              <input 
                type="number" 
                value={formData.jump}
                min={0} max={150}
                onChange={(e) => setFormData({ ...formData, jump: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-section">
            <label>Positions</label>
            <div className="positions-selector">
              {POSITIONS.map(pos => (
                <button
                  key={pos}
                  type="button"
                  className={`pos-chip ${formData.positions.includes(pos) ? 'active' : ''}`}
                  onClick={() => handlePositionToggle(pos)}
                >
                  {pos.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProfileModal;
