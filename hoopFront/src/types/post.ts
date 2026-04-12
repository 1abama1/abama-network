import type { UserSummary } from './user';

export interface Post {
    id: number;
    author: UserSummary;
    content: string;
    createdAt: string;
    likesCount: number;
    commentsCount: number;
    repostsCount: number;
    isLiked: boolean;
    isReposted: boolean;
    originalPost: Post | null;
    caption: string | null;
}

export interface Comment {
    id: number;
    author: UserSummary;
    content: string;
    createdAt: string;
}
