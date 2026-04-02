package com.hoop.hoopback.repository;

import com.hoop.hoopback.entity.Like;
import com.hoop.hoopback.entity.Post;
import com.hoop.hoopback.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndPost(User user, Post post);
    boolean existsByUserAndPost(User user, Post post);
    long countByPost(Post post);

    @org.springframework.data.jpa.repository.Query("SELECT l.post.id FROM Like l WHERE l.user.id = :userId AND l.post.id IN :postIds")
    java.util.Set<Long> findPostIdsByUserIdAndPostIdIn(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("postIds") java.util.Collection<Long> postIds);
}
