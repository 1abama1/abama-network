package com.hoop.hoopback.service.messenger;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UnreadCounterService {

    private final RedisTemplate<String, String> redis;
    private static final String PREFIX = "unread:";
    private static final String CONVS_PREFIX = "unread-convs:";

    private String key(Long userId, Long convId) {
        return PREFIX + userId + ":" + convId;
    }

    private String convsKey(Long userId) {
        return CONVS_PREFIX + userId;
    }

    public void increment(Long recipientId, Long conversationId) {
        String k = key(recipientId, conversationId);
        redis.opsForValue().increment(k);
        redis.opsForSet().add(convsKey(recipientId), String.valueOf(conversationId));
    }

    public void reset(Long userId, Long conversationId) {
        redis.delete(key(userId, conversationId));
        redis.opsForSet().remove(convsKey(userId), String.valueOf(conversationId));
    }

    public int getCount(Long userId, Long conversationId) {
        String val = redis.opsForValue().get(key(userId, conversationId));
        if (val == null) return 0;
        try { return Integer.parseInt(val); }
        catch (NumberFormatException e) { return 0; }
    }

    public int getTotalUnread(Long userId) {
        String cKey = convsKey(userId);
        Boolean hasConvs = redis.hasKey(cKey);
        if (Boolean.FALSE.equals(hasConvs)) return 0;

        List<String> convIds = new ArrayList<>();
        try (Cursor<String> cursor = redis.opsForSet().scan(cKey,
                ScanOptions.scanOptions().count(100).build())) {
            while (cursor.hasNext()) {
                convIds.add(cursor.next());
            }
        }

        if (convIds.isEmpty()) return 0;

        List<String> keys = convIds.stream()
                .map(convId -> key(userId, Long.valueOf(convId)))
                .toList();

        List<String> values = redis.opsForValue().multiGet(keys);
        if (values == null) return 0;

        return values.stream()
                .filter(v -> v != null)
                .mapToInt(v -> {
                    try { return Integer.parseInt(v); }
                    catch (NumberFormatException e) { return 0; }
                })
                .sum();
    }
}
