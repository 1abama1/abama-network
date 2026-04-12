package com.hoop.hoopback.service.messenger;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Service;

import com.hoop.hoopback.dto.messenger.TypingEvent;
import com.hoop.hoopback.service.push.MessagePushService;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TypingService {

    private final RedisTemplate<String, String> redis;
    private final MessagePushService pushService;

    private static final Duration TTL = Duration.ofSeconds(5);

    public void startTyping(String username, Long conversationId, String partnerUsername) {
        String key = typingKey(conversationId, username);
        boolean was = Boolean.TRUE.equals(redis.hasKey(key));
        redis.opsForValue().set(key, "1", TTL);

        if (!was) {
            pushService.pushToUser(
                    partnerUsername,
                    "/queue/typing",
                    new TypingEvent(username, conversationId, true));
        }
    }

    public void stopTyping(String username, Long conversationId, String partnerUsername) {
        redis.delete(typingKey(conversationId, username));
        pushService.pushToUser(
                partnerUsername,
                "/queue/typing",
                new TypingEvent(username, conversationId, false));
    }

    public void clearAll(String username) {
        String pattern = "typing:*:" + username;
        ScanOptions options = ScanOptions.scanOptions().match(pattern).count(100).build();
        List<String> keysToDelete = new ArrayList<>();
        try (Cursor<String> cursor = redis.scan(options)) {
            while (cursor.hasNext()) {
                keysToDelete.add(cursor.next());
            }
        }
        if (!keysToDelete.isEmpty()) {
            redis.delete(keysToDelete);
        }
    }

    private String typingKey(Long convId, String username) {
        return "typing:" + convId + ":" + username;
    }
}
