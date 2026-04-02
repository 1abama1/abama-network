import { useEffect, useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, CalendarDays } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import axiosInstance from '../../api/axiosConfig';
import GameCard from '../../components/Games/GameCard';
import CreateGameModal from '../../components/Games/CreateGameModal';
import '../../components/Games/Games.css';

const SchedulePage = () => {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/games/upcoming');
      setGames(response.data || []);
    } catch (error) {
      console.error('Failed to fetch games', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Группируем игры по датам
  const groupedGames = useMemo(() => {
    const groups: { [key: string]: any[] } = {};

    games.forEach(game => {
      // Форматируем дату в строку 'YYYY-MM-DD' для использования в качестве ключа
      const dateKey = format(new Date(game.dateTime), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(game);
    });

    // Сортируем ключи (даты) по возрастанию и возвращаем массив групп
    return Object.keys(groups)
      .sort()
      .map(date => ({
        date,
        games: groups[date]
      }));
  }, [games]);

  // Функция для красивого форматирования заголовка даты
  const formatGroupHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMMM do'); // Например: "Friday, April 5th"
  };

  const handleRegister = async (id: string | number) => {
    const gameIdStr = String(id);
    const gameIndex = games.findIndex(g => String(g.id) === gameIdStr);
    if (gameIndex === -1) return;

    const game = games[gameIndex];
    const wasRegistered = game.isRegistered;

    // OPTIMISTIC UPDATE
    const updatedGames = [...games];
    updatedGames[gameIndex] = {
      ...game,
      isRegistered: !wasRegistered,
      playersCount: wasRegistered ? game.playersCount - 1 : game.playersCount + 1
    };
    setGames(updatedGames);

    try {
      if (wasRegistered) {
        await axiosInstance.delete(`/games/${id}/register`);
      } else {
        await axiosInstance.post(`/games/${id}/register`);
      }
      // Silently sync with background
      fetchGames();
    } catch (error) {
      // ROLLBACK on failure
      const revertedGames = [...games];
      revertedGames[gameIndex] = game; // Restore original game object
      setGames(revertedGames);
      console.error('Registration failed', error);
      alert("Failed to update registration. Please try again.");
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
          {/* <button className="btn-outline">
            <Filter size={18} />
            <span>Filter</span>
          </button> */}
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
                <motion.div
                  key={group.date}
                  className="date-group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="date-group-header">
                    <div className="date-badge-icon">
                      <CalendarDays size={20} />
                    </div>
                    <h3>{formatGroupHeader(group.date)}</h3>
                    <div className="date-divider"></div>
                  </div>

                  <div className="games-grid">
                    {group.games.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        onRegister={handleRegister}
                      />
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="empty-state">
                <p>No games scheduled. Why not start one?</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateGameModal
            onClose={() => setIsCreateModalOpen(false)}
            onGameCreated={fetchGames}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SchedulePage;
