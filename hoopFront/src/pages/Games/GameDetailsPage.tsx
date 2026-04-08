import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Users,
    Clock,
    ChevronLeft,
    User as UserIcon,
    Calendar,
    ShieldCheck,
    Zap,
    Share2,
    Info,
    Edit2,
    Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import axiosInstance from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import ShareMenu from '../../components/Common/ShareMenu';
import CreateGameModal from '../../components/Games/CreateGameModal';
import '../../components/Games/Games.css';

const GameDetailsPage = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [game, setGame] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
            fetchGameDetails();
            console.error('Registration failed', error);
        }
    };

    const handleDeleteGame = async () => {
        if (!window.confirm("Are you sure you want to cancel and delete this run? This action cannot be undone.")) return;
        
        try {
            await axiosInstance.delete(`/games/${gameId}`);
            navigate('/schedule');
        } catch (error) {
            console.error('Failed to delete game', error);
            alert("Failed to delete game. Please try again.");
        }
    };

    const isCreator = user?.username === game?.creator?.username;

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '80vh' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="basketball-spinner"
                />
            </div>
        );
    }

    if (!game) return <div className="error-state">Game not found</div>;

    const gameDate = new Date(game.dateTime);
    const isFull = game.playersCount >= game.maxPlayers;

    return (
        <motion.div
            className="game-details-premium page-transition"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* HERO SECTION */}
            <div className="game-hero">
                <div className="hero-overlay" />
                <button className="premium-back" onClick={() => navigate(-1)}>
                    <ChevronLeft size={20} />
                </button>

                <div className="hero-content">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="hero-badge"
                    >
                        <Zap size={14} fill="currentColor" />
                        LIVE RUN
                    </motion.div>

                    <h1 className="hero-title text-gradient">{game.title}</h1>

                    <div className="hero-meta">
                        <div className="meta-item">
                            <MapPin size={18} className="text-primary" />
                            <span>{game.location}</span>
                        </div>
                        <div className="meta-item">
                            <UserIcon size={18} className="text-primary" />
                            <span>Hosted by <span className="text-glow">@{game.creator.username}</span></span>
                        </div>
                    </div>
                </div>

                <div className="hero-actions">
                    <ShareMenu url={`/game/${gameId}`} title={`Join the run: ${game.title} at ${game.location}`}>
                        <button className="action-circle-btn"><Share2 size={20} /></button>
                    </ShareMenu>
                    <button
                        className={`btn-primary hero-main-btn ${game.isRegistered ? 'registered' : ''}`}
                        disabled={isFull && !game.isRegistered}
                        onClick={handleRegister}
                    >
                        {game.isRegistered ? 'UNREGISTER' : isFull ? 'SQUAD FULL' : 'JOIN THE RUN'}
                        {!game.isRegistered && !isFull && <Zap size={18} fill="currentColor" />}
                    </button>
                    
                    {isCreator && (
                        <>
                            <button className="action-circle-btn edit-btn" onClick={() => setIsEditModalOpen(true)}>
                                <Edit2 size={20} />
                            </button>
                            <button className="action-circle-btn delete-btn" onClick={handleDeleteGame}>
                                <Trash2 size={20} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="premium-grid container-premium">
                {/* MAIN CONTENT */}
                <div className="premium-main">
                    <section className="glass-card detail-section">
                        <div className="section-title">
                            <Info size={20} className="text-primary" />
                            <h3>Intel & Details</h3>
                        </div>
                        <p className="premium-desc">{game.description}</p>

                        <div className="stats-row">
                            <div className="stat-card">
                                <Calendar size={24} />
                                <div>
                                    <label>Date</label>
                                    <span>{format(gameDate, 'EEEE, MMM do')}</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <Clock size={24} />
                                <div>
                                    <label>Tip-off</label>
                                    <span>{format(gameDate, 'HH:mm')}</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <Users size={24} />
                                <div>
                                    <label>Squad</label>
                                    <span>{game.minPlayers} - {game.maxPlayers}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="glass-card detail-section">
                        <div className="section-title">
                            <ShieldCheck size={20} className="text-primary" />
                            <h3>The Squad</h3>
                            <span className="count-pill">{game.playersCount} / {game.maxPlayers}</span>
                        </div>

                        <div className="premium-players-grid">
                            <AnimatePresence>
                                {game.players?.map((player: any, idx: number) => (
                                    <motion.div
                                        key={player.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="premium-player-tag"
                                    >
                                        <div className="tag-avatar">{player.username[0]}</div>
                                        <span>@{player.username}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {(!game.players || game.players.length === 0) && (
                                <div className="empty-squad">No ballers yet. Step up.</div>
                            )}
                        </div>
                    </section>
                </div>

                {/* SIDEBAR */}
                <aside className="premium-sidebar">
                    <div className="glass-card sidebar-widget">
                        <div className="section-title">
                            <MapPin size={18} className="text-primary" />
                            <h3>Location Intel</h3>
                        </div>
                        <div className="location-visual">
                            <div className="v-map">
                                <MapPin size={40} className="pulse-icon" />
                            </div>
                            <p>{game.location}</p>
                            <small>Outdoor Full Court</small>

                            <button
                                className="directions-btn"
                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(game.location)}`, '_blank')}
                            >
                                <Zap size={16} fill="currentColor" />
                                GET DIRECTIONS
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            <AnimatePresence>
                {isEditModalOpen && (
                    <CreateGameModal 
                        onClose={() => setIsEditModalOpen(false)} 
                        onGameCreated={fetchGameDetails}
                        editGame={game}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default GameDetailsPage;
