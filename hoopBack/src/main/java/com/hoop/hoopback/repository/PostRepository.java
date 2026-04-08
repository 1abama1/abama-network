package com.hoop.hoopback.repository;

import com.hoop.hoopback.entity.Post;
import com.hoop.hoopback.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"author"})
    java.util.Optional<Post> findWithAuthorById(Long id);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"author"})
    Page<Post> findAllByAuthorInOrderByCreatedAtDesc(List<User> authors, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"author"})
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"author"})
    Page<Post> findAllByAuthorUsernameOrderByCreatedAtDesc(String username, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"author"})
    @Query("SELECT p FROM Post p WHERE LOWER(p.content) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY p.createdAt DESC")
    Page<Post> searchByContent(@org.springframework.data.repository.query.Param("q") String q, Pageable pageable);
}
