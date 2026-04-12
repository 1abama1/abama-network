export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        username: string;
        positions: string[] | null;
        height: number | null;
        followersCount: number;
        bio: string | null;
    };
}
