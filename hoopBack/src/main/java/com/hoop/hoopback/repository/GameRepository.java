package com.hoop.hoopback.repository;

import com.hoop.hoopback.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findAllByDateTimeBetweenOrderByDateTimeAsc(LocalDateTime start, LocalDateTime end);
    List<Game> findAllByDateTimeAfterOrderByDateTimeAsc(LocalDateTime now);
}
