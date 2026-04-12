import type { UserSummary } from './user';

export interface Game {
    id: number;
    creator: UserSummary;
    title: string;
    description: string | null;
    location: string;
    dateTime: string;
    minPlayers: number;
    maxPlayers: number;
    playerCount: number;
    players: UserSummary[];
    isRegistered: boolean;
}
