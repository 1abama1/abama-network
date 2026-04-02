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

    @org.springframework.data.jpa.repository.Query("SELECT r.originalPost.id FROM Repost r WHERE r.user.id = :userId AND r.originalPost.id IN :postIds")
    java.util.Set<Long> findOriginalPostIdsByUserIdAndOriginalPostIdIn(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("postIds") java.util.Collection<Long> postIds);
}
