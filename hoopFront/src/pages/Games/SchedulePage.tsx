import { useEffect, useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, CalendarDays } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { gameService } from '../../api/services/gameService';
import { useToast } from '../../components/Common/Toast';
import GameCard from '../../components/Games/GameCard';
import CreateGameModal from '../../components/Games/CreateGameModal';
import type { Game } from '../../types/game';
import '../../components/Games/Games.css';

const SchedulePage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { addToast } = useToast();

  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const response = await gameService.getUpcoming();
      setGames(response.data || []);
    } catch (error) {
      addToast('Failed to fetch games', 'error');
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const groupedGames = useMemo(() => {
    const groups: { [key: string]: Game[] } = {};
    games.forEach(game => {
      const dateKey = format(new Date(game.dateTime), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(game);
    });
    return Object.keys(groups).sort().map(date => ({ date, games: groups[date] }));
  }, [games]);

  const formatGroupHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMMM do');
  };

  const handleRegister = async (id: string | number) => {
    const gameIdStr = String(id);
    const gameIndex = games.findIndex(g => String(g.id) === gameIdStr);
    if (gameIndex === -1) return;

    const game = games[gameIndex];
    const wasRegistered = game.isRegistered;

    const updatedGames = [...games];
    updatedGames[gameIndex] = {
      ...game,
      isRegistered: !wasRegistered,
      playerCount: wasRegistered ? game.playerCount - 1 : game.playerCount + 1
    };
    setGames(updatedGames);

    try {
      if (wasRegistered) {
        await gameService.unregisterFromGame(Number(id));
      } else {
        await gameService.registerForGame(Number(id));
      }
      fetchGames();
    } catch (error) {
      const revertedGames = [...games];
      revertedGames[gameIndex] = game;
      setGames(revertedGames);
      addToast('Failed to update registration', 'error');
    }
  };

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <div className="header-title">
          <h2>Game Schedule</h2>
          <p>Find your next run</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} />
            <span>Create Game</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="feed-loading">
          <div className="basketball-spinner" />
          <p>Loading the scout's report...</p>
        </div>
      ) : (
        <div className="calendar-view">
          <AnimatePresence>
            {groupedGames.length > 0 ? (
              groupedGames.map((group) => (
                <motion.div key={group.date} className="date-group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="date-group-header">
                    <div className="date-badge-icon"><CalendarDays size={20} /></div>
                    <h3>{formatGroupHeader(group.date)}</h3>
                    <div className="date-divider"></div>
                  </div>
                  <div className="games-grid">
                    {group.games.map((game) => (
                      <GameCard key={game.id} game={game} onRegister={handleRegister} />
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="empty-state"><p>No games scheduled. Why not start one?</p></div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateGameModal onClose={() => setIsCreateModalOpen(false)} onGameCreated={fetchGames} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SchedulePage;
