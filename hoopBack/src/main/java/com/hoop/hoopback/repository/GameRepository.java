package com.hoop.hoopback.repository;

import com.hoop.hoopback.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findAllByDateTimeBetweenOrderByDateTimeAsc(LocalDateTime start, LocalDateTime end);

    List<Game> findAllByDateTimeAfterOrderByDateTimeAsc(LocalDateTime now);

    List<Game> findAllByTitleContainingIgnoreCaseOrLocationContainingIgnoreCaseOrderByDateTimeAsc(String title,
            String location);

    @Query("SELECT g FROM Game g LEFT JOIN g.registrations r WHERE g.dateTime > :now GROUP BY g.id ORDER BY COUNT(r) DESC")
    List<Game> findTrendingGames(LocalDateTime now, org.springframework.data.domain.Pageable pageable);
}
