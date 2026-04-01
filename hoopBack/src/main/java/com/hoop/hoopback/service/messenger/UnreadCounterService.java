package com.hoop.hoopback.service.messenger;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

/**
 * Быстрые счётчики непрочитанных через Redis INCR/DECR.
 *
 * Ключ:  unread:{userId}:{conversationId}
 * Синхронизируется с БД при markAllRead.
 */
@Service
@RequiredArgsConstructor
public class UnreadCounterService {

    private final RedisTemplate<String, String> redis;
    private static final String PREFIX = "unread:";

    private String key(Long userId, Long convId) {
        return PREFIX + userId + ":" + convId;
    }

    public void increment(Long recipientId, Long conversationId) {
        redis.opsForValue().increment(key(recipientId, conversationId));
    }

    public void reset(Long userId, Long conversationId) {
        redis.delete(key(userId, conversationId));
    }

    public int getCount(Long userId, Long conversationId) {
        String val = redis.opsForValue().get(key(userId, conversationId));
        if (val == null) return 0;
        try { return Integer.parseInt(val); }
        catch (NumberFormatException e) { return 0; }
    }

    /** Суммарные непрочитанные по всем диалогам пользователя */
    public int getTotalUnread(Long userId) {
        var keys = redis.keys(PREFIX + userId + ":*");
        if (keys == null || keys.isEmpty()) return 0;
        return keys.stream()
            .map(k -> redis.opsForValue().get(k))
            .filter(v -> v != null)
            .mapToInt(v -> {
                try { return Integer.parseInt(v); }
                catch (NumberFormatException e) { return 0; }
            })
            .sum();
    }
}
