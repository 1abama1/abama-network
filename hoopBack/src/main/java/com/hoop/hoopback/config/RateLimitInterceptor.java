package com.hoop.hoopback.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RedisTemplate<String, String> redis;
    private static final int MAX_REQUESTS = 100;
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private static final String LUA_SCRIPT =
            "local count = redis.call('INCR', KEYS[1]) " +
            "if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end " +
            "return count";

    private final DefaultRedisScript<Long> rateLimitScript = new DefaultRedisScript<>(LUA_SCRIPT, Long.class);

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler)
            throws Exception {
        String ip = req.getRemoteAddr();
        String key = "ratelimit:" + ip;

        Long count = redis.execute(rateLimitScript, List.of(key), String.valueOf(WINDOW.getSeconds()));
        if (count != null && count > MAX_REQUESTS) {
            res.setStatus(429);
            res.getWriter().write("{\"message\":\"Too many requests\"}");
            return false;
        }
        return true;
    }
}
