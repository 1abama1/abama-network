import type { UserSummary } from './user';

export type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW' | 'REPOST' | 'GAME_JOIN';

export interface Notification {
    id: number;
    type: NotificationType;
    actor: UserSummary | null;
    entityId: number | null;
    entityType: string | null;
    isRead: boolean;
    createdAt: string;
}
