package com.hoop.hoopback.service.messenger;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.hoop.hoopback.dto.messenger.PresenceEvent;

import java.time.Duration;
import java.util.Set;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.List;

/**
 * Управляет онлайн-статусом пользователей через Redis.
 */
@Service
@RequiredArgsConstructor
public class PresenceService {

    private final RedisTemplate<String, String> redis;
    private final SimpMessagingTemplate messaging;

    private static final Duration TTL = Duration.ofSeconds(70);
    private static final String PREFIX = "presence:";
    private static final String TOPIC = "/topic/presence";

    public void markOnline(String username) {
        String key = PREFIX + username;
        Boolean isNew = redis.opsForValue().setIfAbsent(key, "1", TTL);
        redis.expire(key, TTL);
        if (Boolean.TRUE.equals(isNew)) {
            messaging.convertAndSend(TOPIC, new PresenceEvent(username, true));
        }
    }

    public void markOffline(String username) {
        String key = PREFIX + username;
        Boolean existed = redis.delete(key);
        if (Boolean.TRUE.equals(existed)) {
            messaging.convertAndSend(TOPIC, new PresenceEvent(username, false));
        }
    }

    public boolean isOnline(String username) {
        return Boolean.TRUE.equals(redis.hasKey(PREFIX + username));
    }

    public Set<String> getOnlineFrom(Set<String> usernames) {
        // Pipeline with explicit cast to fix ambiguity in Java 21
        List<Object> result = redis.executePipelined((RedisCallback<Object>) connection -> {
            for (String u : usernames) {
                connection.keyCommands().exists(redis.getStringSerializer().serialize(PREFIX + u));
            }
            return null;
        });

        Set<String> online = new HashSet<>();
        List<String> list = new ArrayList<>(usernames);
        for (int i = 0; i < list.size(); i++) {
            if (result != null && i < result.size() && Boolean.TRUE.equals(result.get(i))) {
                online.add(list.get(i));
            }
        }
        return online;
    }
}
