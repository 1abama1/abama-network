package com.hoop.hoopback.repository;

import com.hoop.hoopback.entity.Post;
import com.hoop.hoopback.entity.Repost;
import com.hoop.hoopback.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RepostRepository extends JpaRepository<Repost, Long> {
    Optional<Repost> findByUserAndOriginalPost(User user, Post originalPost);
    boolean existsByUserAndOriginalPost(User user, Post originalPost);
    long countByOriginalPost(Post originalPost);
}
