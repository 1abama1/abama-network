package com.hoop.hoopback.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RedisTemplate<String, String> redis;
    private static final int MAX_REQUESTS = 100;
    private static final Duration WINDOW   = Duration.ofMinutes(1);

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler)
            throws Exception {
        String ip  = req.getRemoteAddr();
        String key = "ratelimit:" + ip;

        Long count = redis.opsForValue().increment(key);
        if (count != null && count == 1) {
            redis.expire(key, WINDOW);
        }
        if (count != null && count > MAX_REQUESTS) {
            res.setStatus(429);
            res.getWriter().write("{\"message\":\"Too many requests\"}");
            return false;
        }
        return true;
    }
}
