package com.hoop.hoopback.repository;

import com.hoop.hoopback.entity.Game;
import com.hoop.hoopback.entity.GameRegistration;
import com.hoop.hoopback.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameRegistrationRepository extends JpaRepository<GameRegistration, Long> {
    Optional<GameRegistration> findByUserAndGame(User user, Game game);
    boolean existsByUserAndGame(User user, Game game);
    long countByGame(Game game);
}
