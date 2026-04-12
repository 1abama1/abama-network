import { useState, useCallback } from 'react';
import { userService } from '../api/services/userService';
import { useToast } from '../components/Common/Toast';

export function useFollow() {
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const toggleFollow = useCallback(async (username: string, isFollowing: boolean): Promise<boolean> => {
        setLoading(true);
        try {
            if (isFollowing) {
                await userService.unfollow(username);
            } else {
                await userService.follow(username);
            }
            return !isFollowing;
        } catch (err) {
            addToast('Failed to update follow status', 'error');
            return isFollowing;
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    return { toggleFollow, loading };
}
