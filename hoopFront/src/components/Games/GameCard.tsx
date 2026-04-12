import { motion } from 'framer-motion';
import { MapPin, Users, Clock, ChevronRight, User } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { Game } from '../../types/game';
import { renderContentWithMentions } from '../../utils/renderContentWithMentions';
import { ensureUtc } from '../../utils/dateUtils';
import './Games.css';

interface GameCardProps {
  game: Game;
  onRegister: (id: number) => void;
}

const GameCard = ({ game, onRegister }: GameCardProps) => {
  const gameDate = new Date(ensureUtc(game.dateTime));
  const isFull = game.playerCount >= game.maxPlayers;
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/game/${game.id}`);
  };

  const handleProfileClick = (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    navigate(`/profile/${username}`);
  };

  return (
    <motion.div
      className="game-card glass"
      whileHover={{ y: -5, borderColor: 'var(--primary)' }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="game-card-header">
        <div className="game-main-info">
          <h3>{game.title}</h3>
          <div className="game-sub-info">
            <span className="game-location">
              <MapPin size={14} /> {game.location}
            </span>
            <span className="header-divider">•</span>
            <span className="game-creator" onClick={(e) => handleProfileClick(e, game.creator.username)} style={{ cursor: 'pointer' }}>
              <User size={14} /> @{game.creator.username}
            </span>
          </div>
        </div>
        {game.isRegistered && (
          <div className="status-container">
            <span className="registered-badge">Registered</span>
          </div>
        )}
      </div>

      <div className="game-details">
        <div className="detail-item">
          <Clock size={16} />
          <span>{format(gameDate, 'HH:mm')}</span>
        </div>
        <div className="detail-item">
          <Users size={16} />
          <span>{game.playerCount}/{game.maxPlayers}</span>
        </div>
      </div>

      <p className="game-description">
        {renderContentWithMentions(game.description || '').map((part, index) =>
          part.isMention ? (
            <span
              key={index}
              className="mention-link"
              onClick={(e) => handleProfileClick(e, part.text.substring(1))}
              style={{ color: 'var(--primary)', cursor: 'pointer', position: 'relative', zIndex: 10 }}
            >
              {part.text}
            </span>
          ) : (
            <span key={index}>{part.text}</span>
          )
        )}
      </p>

      <div className="game-card-footer">
        <div className="player-progress-container">
          <div className="progress-text">
            <span>Progress</span>
            <span>{Math.round((game.playerCount / game.maxPlayers) * 100)}%</span>
          </div>
          <div className="player-progress">
            <div
              className="progress-bar"
              style={{ width: `${(game.playerCount / game.maxPlayers) * 100}%` }}
            />
          </div>
        </div>

        <button
          className={`btn-primary ${game.isRegistered ? 'btn-outline' : ''}`}
          disabled={isFull && !game.isRegistered}
          onClick={(e) => {
            e.stopPropagation();
            onRegister(game.id);
          }}
        >
          {game.isRegistered ? 'Leave' : isFull ? 'Full' : 'Join'}
          <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default GameCard;
