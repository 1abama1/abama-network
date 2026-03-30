import { motion } from 'framer-motion';
import { MapPin, Users, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
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

  return (
    <motion.div 
      className="game-card glass"
      whileHover={{ y: -5, borderColor: 'var(--primary)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="game-card-header">
        <div className="game-date-badge">
          <span className="month">{format(gameDate, 'MMM')}</span>
          <span className="day">{format(gameDate, 'dd')}</span>
        </div>
        <div className="game-main-info">
          <h3>{game.title}</h3>
          <p className="game-location"><MapPin size={14} /> {game.location}</p>
        </div>
        {game.isRegistered && <span className="registered-badge">Registered</span>}
      </div>

      <div className="game-details">
        <div className="detail-item">
          <Clock size={16} />
          <span>{format(gameDate, 'p')}</span>
        </div>
        <div className="detail-item">
          <Users size={16} />
          <span>{game.playersCount}/{game.maxPlayers} Players</span>
        </div>
      </div>

      <p className="game-description">{game.description}</p>

      <div className="game-card-footer">
        <div className="player-progress">
          <div 
            className="progress-bar" 
            style={{ width: `${(game.playersCount / game.maxPlayers) * 100}%` }} 
          />
        </div>
        <button 
          className={`btn-primary ${game.isRegistered ? 'btn-outline' : ''}`}
          disabled={isFull && !game.isRegistered}
          onClick={() => onRegister(game.id)}
        >
          {game.isRegistered ? 'Leave' : isFull ? 'Full' : 'Join Game'}
          <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default GameCard;
