package com.hoop.hoopback.repository;

import com.hoop.hoopback.entity.OtpToken;
import com.hoop.hoopback.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findByCodeAndUser(String code, User user);
    Optional<OtpToken> findByUser(User user);
    void deleteByUser(User user);
    void deleteByExpiredAtBefore(LocalDateTime time);
}
