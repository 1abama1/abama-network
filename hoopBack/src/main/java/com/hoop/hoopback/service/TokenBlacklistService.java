package com.hoop.hoopback.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final RedisTemplate<String, String> redis;
    private static final String BLACKLIST_PREFIX = "blacklist:";

    public void blacklist(String jti, Date expiration) {
        long ttlSeconds = (expiration.getTime() - System.currentTimeMillis()) / 1000;
        if (ttlSeconds > 0) {
            redis.opsForValue().set(
                BLACKLIST_PREFIX + jti,
                "1",
                Duration.ofSeconds(ttlSeconds)
            );
        }
    }

    public boolean isBlacklisted(String jti) {
        return Boolean.TRUE.equals(redis.hasKey(BLACKLIST_PREFIX + jti));
    }
}
