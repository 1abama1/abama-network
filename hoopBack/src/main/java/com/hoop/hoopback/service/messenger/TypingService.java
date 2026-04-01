package com.hoop.hoopback.service.messenger;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.hoop.hoopback.dto.messenger.TypingEvent;

import java.time.Duration;

/**
 * Typing indicators через Redis TTL.
 *
 * Ключ: typing:{conversationId}:{username} (TTL 5 сек)
 * Клиент шлёт ping каждые 3 сек пока печатает.
 * При исчезновении ключа (TTL истёк) сервер не посылает nothing — фронт сам
 * скрывает индикатор по таймауту (6 сек без события = stopped).
 */
@Service
@RequiredArgsConstructor
public class TypingService {

    private final RedisTemplate<String, String> redis;
    private final SimpMessagingTemplate messaging;

    private static final Duration TTL = Duration.ofSeconds(5);

    public void startTyping(String username, Long conversationId, String partnerUsername) {
        String key = typingKey(conversationId, username);
        boolean was = Boolean.TRUE.equals(redis.hasKey(key));
        redis.opsForValue().set(key, "1", TTL);

        // Рассылаем только при старте, не каждый ping
        if (!was) {
            messaging.convertAndSendToUser(
                    partnerUsername,
                    "/queue/typing",
                    new TypingEvent(username, conversationId, true));
        }
    }

    public void stopTyping(String username, Long conversationId, String partnerUsername) {
        redis.delete(typingKey(conversationId, username));
        messaging.convertAndSendToUser(
                partnerUsername,
                "/queue/typing",
                new TypingEvent(username, conversationId, false));
    }

    public void clearAll(String username) {
        var keys = redis.keys("typing:*:" + username);
        if (keys != null && !keys.isEmpty()) {
            redis.delete(keys);
        }
    }

    private String typingKey(Long convId, String username) {
        return "typing:" + convId + ":" + username;
    }
}
