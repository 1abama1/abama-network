import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MapPin,
    Users,
    Clock,
    ChevronLeft,
    User,
    Calendar,
    ShieldCheck,
    Zap
} from 'lucide-react';
import { format } from 'date-fns';
import axiosInstance from '../../api/axiosConfig';
import '../../components/Games/Games.css';

const GameDetailsPage = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const [game, setGame] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchGameDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/games/${gameId}`);
            setGame(response.data);
        } catch (error) {
            console.error('Failed to fetch game details', error);
        } finally {
            setLoading(false);
        }
    }, [gameId]);

    useEffect(() => {
        fetchGameDetails();
    }, [fetchGameDetails]);

    const handleRegister = async () => {
        if (!game) return;
        const wasRegistered = game.isRegistered;

        // OPTIMISTIC UPDATE
        setGame({
            ...game,
            isRegistered: !wasRegistered,
            playersCount: wasRegistered ? game.playersCount - 1 : game.playersCount + 1
        });

        try {
            if (wasRegistered) {
                await axiosInstance.delete(`/games/${gameId}/register`);
            } else {
                await axiosInstance.post(`/games/${gameId}/register`);
            }
            fetchGameDetails();
        } catch (error) {
            fetchGameDetails(); // Rollback by refetching
            console.error('Registration failed', error);
            alert("Failed to update registration. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="feed-loading">
                <div className="basketball-spinner" />
                <p>Loading game intel...</p>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="error-state">
                <h2>Game not found</h2>
                <button className="btn-primary" onClick={() => navigate('/schedule')}>
                    Back to Schedule
                </button>
            </div>
        );
    }

    const gameDate = new Date(game.dateTime);
    const isFull = game.playersCount >= game.maxPlayers;

    return (
        <motion.div
            className="game-details-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="details-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} />
                </button>
                <div className="header-content">
                    <div className="title-section">
                        <h1 className="game-title">{game.title}</h1>
                        <div className="game-meta">
                            <span className="creator-tag">
                                <User size={16} /> Hosted by @{game.creator.username}
                            </span>
                            <span className="meta-divider">•</span>
                            <span className="location-tag">
                                <MapPin size={16} /> {game.location}
                            </span>
                        </div>
                    </div>
                    <button
                        className={`btn-primary register-btn ${game.isRegistered ? 'btn-outline' : ''}`}
                        disabled={isFull && !game.isRegistered}
                        onClick={handleRegister}
                    >
                        {game.isRegistered ? 'Leave Game' : isFull ? 'Game Full' : 'Join Run'}
                        <Zap size={18} fill={game.isRegistered ? 'none' : 'currentColor'} />
                    </button>
                </div>
            </div>

            <div className="details-grid">
                <div className="details-main">
                    <section className="info-card glass">
                        <h3><Zap size={20} className="icon-primary" /> About this Game</h3>
                        <p className="description-text">{game.description}</p>

                        <div className="info-stats">
                            <div className="info-stat">
                                <Calendar size={20} />
                                <div className="stat-label">Date</div>
                                <div className="stat-value">{format(gameDate, 'EEEE, MMMM do')}</div>
                            </div>
                            <div className="info-stat">
                                <Clock size={20} />
                                <div className="stat-label">Time</div>
                                <div className="stat-value">{format(gameDate, 'HH:mm')}</div>
                            </div>
                            <div className="info-stat">
                                <Users size={20} />
                                <div className="stat-label">Squad Size</div>
                                <div className="stat-value">{game.minPlayers} - {game.maxPlayers} Players</div>
                            </div>
                        </div>
                    </section>

                    <section className="players-section glass">
                        <div className="section-header">
                            <h3><ShieldCheck size={20} className="icon-primary" /> Registered Players</h3>
                            <span className="player-count-badge">
                                {game.playersCount} / {game.maxPlayers}
                            </span>
                        </div>

                        <div className="players-list">
                            {game.players && game.players.length > 0 ? (
                                game.players.map((player: any) => (
                                    <motion.div
                                        key={player.id}
                                        className="player-item"
                                        whileHover={{ x: 5 }}
                                    >
                                        <div className="player-avatar">
                                            {player.username[0].toUpperCase()}
                                        </div>
                                        <div className="player-info">
                                            <span className="player-name">@{player.username}</span>
                                            <span className="player-meta">
                                                {player.positions?.join(', ') || 'Crossover Master'}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="empty-players">
                                    <p>No players have joined yet. Be the first!</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <aside className="details-sidebar">
                    {/* We can add more info here like map or similar games */}
                    <div className="sidebar-card glass">
                        <h3>Court Location</h3>
                        <div className="mini-map-placeholder">
                            <MapPin size={48} className="map-icon" />
                            <p>{game.location}</p>
                        </div>
                    </div>
                </aside>
            </div>
        </motion.div>
    );
};

export default GameDetailsPage;
