import { motion } from 'framer-motion';
import { MapPin, Users, Clock, ChevronRight, User } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import './Games.css';

interface GameProps {
  game: {
    id: string | number;
    title: string;
    description: string;
    location: string;
    dateTime: string;
    minPlayers: number;
    maxPlayers: number;
    playersCount: number;
    creator: {
      username: string;
    };
    isRegistered: boolean;
  };
  onRegister: (id: string | number) => void;
}

const GameCard = ({ game, onRegister }: GameProps) => {
  const gameDate = new Date(game.dateTime);
  const isFull = game.playersCount >= game.maxPlayers;
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/game/${game.id}`);
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
            <span className="game-creator">
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
          <span>{game.playersCount}/{game.maxPlayers}</span>
        </div>
      </div>

      <p className="game-description">{game.description}</p>

      <div className="game-card-footer">
        <div className="player-progress-container">
          <div className="progress-text">
            <span>Progress</span>
            <span>{Math.round((game.playersCount / game.maxPlayers) * 100)}%</span>
          </div>
          <div className="player-progress">
            <div
              className="progress-bar"
              style={{ width: `${(game.playersCount / game.maxPlayers) * 100}%` }}
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
