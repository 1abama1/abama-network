package com.hoop.hoopback.service;

import com.hoop.hoopback.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpCleanupTask {

    private final OtpRepository otpRepository;

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Starting cleanup of expired OTP tokens...");
        otpRepository.deleteByExpiredAtBefore(LocalDateTime.now());
        log.info("Cleanup of expired OTP tokens completed.");
    }
}
