package com.hoop.hoopback.service;

import com.hoop.hoopback.entity.OtpToken;
import com.hoop.hoopback.entity.User;
import com.hoop.hoopback.exception.InvalidCredentialsException;
import com.hoop.hoopback.exception.TokenExpiredException;
import com.hoop.hoopback.exception.TooManyOtpAttemptsException;
import com.hoop.hoopback.repository.OtpRepository;
import com.hoop.hoopback.repository.UserRepository;
import com.hoop.hoopback.service.strategy.OtpDeliveryStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepository otpRepository;
    private final UserRepository userRepository;
    private final OtpDeliveryStrategy otpDeliveryStrategy;
    private final SecureRandom secureRandom = new SecureRandom();

    private static final int MAX_ATTEMPTS = 5;
    private static final int OTP_EXPIRATION_MINUTES = 10;

    @Transactional
    public void generateAndSendOtp(User user) {
        otpRepository.deleteByUser(user);

        String otpCode = String.format("%06d", secureRandom.nextInt(1000000));
        
        OtpToken otpToken = OtpToken.builder()
                .code(otpCode)
                .user(user)
                .expiredAt(LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES))
                .build();
                
        otpRepository.save(otpToken);
        
        otpDeliveryStrategy.deliverOtp(user, otpCode);
    }

    @Transactional
    public void verifyOtp(String identifier, String code) {
        User user = userRepository.findByEmail(identifier)
                .orElseGet(() -> userRepository.findByUsername(identifier)
                        .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден")));

        OtpToken otpToken = otpRepository.findByUser(user)
                .orElseThrow(() -> new InvalidCredentialsException("OTP код не найден или не был запрошен"));

        if (otpToken.getExpiredAt().isBefore(LocalDateTime.now())) {
            otpRepository.delete(otpToken);
            throw new TokenExpiredException("Срок действия OTP кода истек. Пожалуйста, запросите новый.");
        }

        if (!otpToken.getCode().equals(code)) {
            otpToken.setAttempts(otpToken.getAttempts() + 1);
            otpRepository.save(otpToken);

            if (otpToken.getAttempts() >= MAX_ATTEMPTS) {
                otpRepository.delete(otpToken);
                throw new TooManyOtpAttemptsException("Превышено максимальное количество попыток. Запросите новый код.");
            }
            throw new InvalidCredentialsException("Неверный OTP код. Осталось попыток: " + (MAX_ATTEMPTS - otpToken.getAttempts()));
        }
        
        otpToken.setConfirmedAt(LocalDateTime.now());
        otpRepository.save(otpToken);
        
        user.setEnabled(true);
        userRepository.save(user);
    }

    @Transactional
    public void resendOtp(String identifier) {
        User user = userRepository.findByEmail(identifier)
                .orElseGet(() -> userRepository.findByUsername(identifier)
                        .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден")));
        
        generateAndSendOtp(user);
    }
}
