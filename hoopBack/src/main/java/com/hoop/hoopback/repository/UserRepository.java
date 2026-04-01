package com.hoop.hoopback.repository;

import com.hoop.hoopback.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUsernameIgnoreCase(String username);

    default Optional<User> findByUsername(String username) {
        return findByUsernameIgnoreCase(username);
    }

    boolean existsByEmail(String email);

    boolean existsByUsernameIgnoreCase(String username);

    default boolean existsByUsername(String username) {
        return existsByUsernameIgnoreCase(username);
    }

    List<User> findByUsernameContainingIgnoreCase(String username);

    @Query("SELECT u.followers FROM User u WHERE LOWER(u.username) = LOWER(:username)")
    List<User> findFollowersByUsername(String username);

    @Query("SELECT u.following FROM User u WHERE LOWER(u.username) = LOWER(:username)")
    List<User> findFollowingByUsername(String username);

    @Query("SELECT COUNT(f) FROM User u JOIN u.followers f WHERE u.id = :userId")
    long countFollowersByUserId(Long userId);

    @Query("SELECT COUNT(f) FROM User u JOIN u.following f WHERE u.id = :userId")
    long countFollowingByUserId(Long userId);

    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM User t JOIN t.followers f WHERE t.id = :targetId AND f.id = :followerId")
    boolean isFollowing(Long targetId, Long followerId);

    @Query("SELECT f FROM User u JOIN u.following f JOIN f.following f2 WHERE u.id = :userId AND f2.id = :userId")
    List<User> findMutualFollowers(Long userId);

    default boolean isMutualFollow(Long userAId, Long userBId) {
        return isFollowing(userAId, userBId) && isFollowing(userBId, userAId);
    }
}
