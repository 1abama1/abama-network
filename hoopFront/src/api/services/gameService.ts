import axiosInstance from '../axiosConfig';
import type { Game } from '../../types/game';

export const gameService = {
    createGame(data: { title: string; description?: string; location: string; dateTime: string; minPlayers: number; maxPlayers: number }) {
        return axiosInstance.post<Game>('/games', data);
    },
    getUpcoming() {
        return axiosInstance.get<Game[]>('/games/upcoming');
    },
    getGameDetails(gameId: number) {
        return axiosInstance.get<Game>(`/games/${gameId}`);
    },
    registerForGame(gameId: number) {
        return axiosInstance.post(`/games/${gameId}/register`);
    },
    unregisterFromGame(gameId: number) {
        return axiosInstance.delete(`/games/${gameId}/register`);
    },
    updateGame(gameId: number, data: { title: string; description?: string; location: string; dateTime: string; minPlayers: number; maxPlayers: number }) {
        return axiosInstance.put<Game>(`/games/${gameId}`, data);
    },
    deleteGame(gameId: number) {
        return axiosInstance.delete(`/games/${gameId}`);
    },
    searchGames(q: string) {
        return axiosInstance.get<Game[]>('/games/search', { params: { q } });
    },
    getTrending() {
        return axiosInstance.get<Game[]>('/games/trending');
    },
    getUserGames(username: string) {
        return axiosInstance.get<Game[]>(`/games/user/${username}`);
    },
};
