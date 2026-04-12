import { describe, it, expect, beforeEach } from 'vitest';
import { tokenStorage } from '../utils/tokenStorage';

describe('tokenStorage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('stores and retrieves access token', () => {
        expect(tokenStorage.getAccessToken()).toBeNull();
        tokenStorage.setTokens('access-123', 'refresh-456');
        expect(tokenStorage.getAccessToken()).toBe('access-123');
        expect(tokenStorage.getRefreshToken()).toBe('refresh-456');
    });

    it('stores and retrieves user', () => {
        const user = { id: 1, username: 'test', email: 'test@test.com' };
        expect(tokenStorage.getUser()).toBeNull();
        tokenStorage.setUser(user);
        expect(tokenStorage.getUser<typeof user>()).toEqual(user);
    });

    it('clears all data', () => {
        tokenStorage.setTokens('a', 'b');
        tokenStorage.setUser({ id: 1 });
        tokenStorage.clear();
        expect(tokenStorage.getAccessToken()).toBeNull();
        expect(tokenStorage.getUser()).toBeNull();
    });
});
