const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const USER_KEY = 'user';

export const tokenStorage = {
    getAccessToken(): string | null {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch {
            return null;
        }
    },

    getRefreshToken(): string | null {
        try {
            return localStorage.getItem(REFRESH_KEY);
        } catch {
            return null;
        }
    },

    setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_KEY, refreshToken);
    },

    getUser<T>(): T | null {
        try {
            const raw = localStorage.getItem(USER_KEY);
            if (!raw) return null;
            return JSON.parse(raw) as T;
        } catch {
            return null;
        }
    },

    setUser<T>(user: T): void {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    clear(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
    },
};
