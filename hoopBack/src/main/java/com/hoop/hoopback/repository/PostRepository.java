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
    Page<Post> findAllByAuthorInOrderByCreatedAtDesc(List<User> authors, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"author"})
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"author"})
    Page<Post> findAllByAuthorUsernameOrderByCreatedAtDesc(String username, Pageable pageable);
}
