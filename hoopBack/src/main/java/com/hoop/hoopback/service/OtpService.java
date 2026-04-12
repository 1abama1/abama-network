package com.hoop.hoopback.service;

import com.hoop.hoopback.entity.User;
import com.hoop.hoopback.exception.InvalidCredentialsException;
import com.hoop.hoopback.exception.ResourceNotFoundException;
import com.hoop.hoopback.exception.TooManyOtpAttemptsException;
import com.hoop.hoopback.repository.UserRepository;
import com.hoop.hoopback.service.strategy.OtpDeliveryStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final RedisTemplate<String, String> redis;
    private final UserRepository userRepository;
    private final OtpDeliveryStrategy otpDeliveryStrategy;
    private final SecureRandom secureRandom = new SecureRandom();

    private static final int MAX_ATTEMPTS   = 5;
    private static final int TTL_MINUTES    = 10;
    private static final String OTP_PREFIX  = "otp:code:";
    private static final String ATT_PREFIX  = "otp:attempts:";

    @Transactional
    public void generateAndSendOtp(User user) {
        String key = OTP_PREFIX + user.getId();
        String attKey = ATT_PREFIX + user.getId();

        String code = String.format("%06d", secureRandom.nextInt(1_000_000));

        redis.opsForValue().set(key, code, Duration.ofMinutes(TTL_MINUTES));
        redis.delete(attKey); // сбросить счётчик попыток

        otpDeliveryStrategy.deliverOtp(user, code);
    }

    @Transactional
    public void verifyOtp(String identifier, String code) {
        User user = findUser(identifier);

        String key    = OTP_PREFIX + user.getId();
        String attKey = ATT_PREFIX + user.getId();

        String stored = redis.opsForValue().get(key);

        if (stored == null) {
            throw new InvalidCredentialsException(
                "OTP не найден или истёк. Запросите новый."
            );
        }

        if (!stored.equals(code)) {
            Long attempts = redis.opsForValue().increment(attKey);
            redis.expire(attKey, Duration.ofMinutes(TTL_MINUTES));

            if (attempts != null && attempts >= MAX_ATTEMPTS) {
                redis.delete(key);
                redis.delete(attKey);
                throw new TooManyOtpAttemptsException(
                    "Превышено количество попыток. Запросите новый код."
                );
            }
            throw new InvalidCredentialsException(
                "Неверный OTP. Осталось попыток: " + (MAX_ATTEMPTS - attempts)
            );
        }

        // успех — чистим Redis, включаем аккаунт
        redis.delete(key);
        redis.delete(attKey);
        user.setEnabled(true);
        userRepository.save(user);
    }

    public void resendOtp(String identifier) {
        generateAndSendOtp(findUser(identifier));
    }

    private User findUser(String identifier) {
        return userRepository.findByEmail(identifier)
            .or(() -> userRepository.findByUsername(identifier))
            .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));
    }
}
