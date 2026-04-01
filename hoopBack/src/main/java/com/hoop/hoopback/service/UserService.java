package com.hoop.hoopback.service;

import com.hoop.hoopback.dto.request.UpdateProfileRequest;
import com.hoop.hoopback.dto.response.UserDto;
import com.hoop.hoopback.dto.response.UserSummaryDto;
import com.hoop.hoopback.entity.User;
import com.hoop.hoopback.entity.NotificationType;
import com.hoop.hoopback.exception.InvalidCredentialsException;
import com.hoop.hoopback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Cacheable(value = "profiles", key = "#username?.toLowerCase() + ':' + #currentUsername?.toLowerCase()")
    public UserDto getProfile(String username, String currentUsername) {
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));

        User currentUser = currentUsername != null
                ? userRepository.findByUsernameIgnoreCase(currentUsername).orElse(null)
                : null;

        return mapToDto(user, currentUser);
    }

    @Transactional
    @CacheEvict(value = "profiles", key = "#username?.toLowerCase() + ':*'", allEntries = true)
    public UserDto updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));

        user.setBio(request.bio());
        user.setHeight(request.height());
        user.setWeight(request.weight());
        user.setJump(request.jump());
        user.setPositions(request.positions());

        return mapToDto(userRepository.save(user), user);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "profiles", allEntries = true)
    })
    public void follow(String followerUsername, String targetUsername) {
        if (followerUsername.equals(targetUsername)) {
            throw new IllegalArgumentException("Вы не можете подписаться на самого себя");
        }

        User follower = userRepository.findByUsernameIgnoreCase(followerUsername)
                .orElseThrow(() -> new InvalidCredentialsException("Текущий пользователь не найден"));
        User target = userRepository.findByUsernameIgnoreCase(targetUsername)
                .orElseThrow(() -> new InvalidCredentialsException("Целевой пользователь не найден"));

        target.getFollowers().add(follower);
        userRepository.save(target);

        // Notify target user
        notificationService.notify(target, follower, NotificationType.FOLLOW, target.getId(), "USER");
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "profiles", allEntries = true)
    })
    public void unfollow(String followerUsername, String targetUsername) {
        User follower = userRepository.findByUsernameIgnoreCase(followerUsername)
                .orElseThrow(() -> new InvalidCredentialsException("Текущий пользователь не найден"));
        User target = userRepository.findByUsernameIgnoreCase(targetUsername)
                .orElseThrow(() -> new InvalidCredentialsException("Целевой пользователь не найден"));

        target.getFollowers().remove(follower);
        userRepository.save(target);
    }

    public List<UserSummaryDto> getFollowers(String username) {
        return userRepository.findFollowersByUsername(username).stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());
    }

    public List<UserSummaryDto> getFollowing(String username) {
        return userRepository.findFollowingByUsername(username).stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());
    }

    public List<UserSummaryDto> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCase(query).stream()
                .limit(10)
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());
    }

    public List<UserSummaryDto> getRecommendedUsers(String currentUsername) {
        User currentUser = currentUsername != null
                ? userRepository.findByUsernameIgnoreCase(currentUsername).orElse(null)
                : null;
        Long currentUserId = currentUser != null ? currentUser.getId() : -1L;
        return userRepository.findRecommendedUsers(currentUserId, PageRequest.of(0, 3)).stream()
                .map(this::mapToSummaryDto)
                .collect(Collectors.toList());
    }

    private UserDto mapToDto(User user, User currentUser) {
        boolean isFollowing = currentUser != null && userRepository.isFollowing(user.getId(), currentUser.getId());

        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getHeight(),
                user.getWeight(),
                user.getJump(),
                user.getPositions(),
                userRepository.countFollowersByUserId(user.getId()),
                userRepository.countFollowingByUserId(user.getId()),
                isFollowing);
    }

    private UserSummaryDto mapToSummaryDto(User user) {
        return new UserSummaryDto(
                user.getId(),
                user.getUsername(),
                user.getPositions(),
                user.getHeight(),
                userRepository.countFollowersByUserId(user.getId()));
    }
}
