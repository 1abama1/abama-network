export interface UserSummary {
    id: number;
    username: string;
    positions: string[] | null;
    height: number | null;
    followersCount: number;
    bio: string | null;
}

export interface Profile {
    id: number;
    username: string;
    email: string;
    bio: string | null;
    height: number | null;
    weight: number | null;
    jump: number | null;
    positions: string[] | null;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
}
