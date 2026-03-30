import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Filter } from 'lucide-react';
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
          <button className="btn-outline">
            <Filter size={18} />
            <span>Filter</span>
          </button>
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
        <div className="games-grid">
          <AnimatePresence>
            {games.length > 0 ? (
              games.map((game) => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  onRegister={handleRegister} 
                />
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
