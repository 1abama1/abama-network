package com.hoop.hoopback.service;

import com.hoop.hoopback.dto.request.UpdateProfileRequest;
import com.hoop.hoopback.dto.response.UserDto;
import com.hoop.hoopback.dto.response.UserSummaryDto;
import com.hoop.hoopback.entity.User;
import com.hoop.hoopback.exception.InvalidCredentialsException;
import com.hoop.hoopback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDto getProfile(String username, String currentUsername) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));
        
        User currentUser = currentUsername != null ? 
            userRepository.findByUsername(currentUsername).orElse(null) : null;
            
        return mapToDto(user, currentUser);
    }

    @Transactional
    public UserDto updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));

        user.setBio(request.bio());
        user.setHeight(request.height());
        user.setWeight(request.weight());
        user.setJump(request.jump());
        user.setPositions(request.positions());

        return mapToDto(userRepository.save(user), user);
    }

    @Transactional
    public void follow(String followerUsername, String targetUsername) {
        if (followerUsername.equals(targetUsername)) {
            throw new IllegalArgumentException("Вы не можете подписаться на самого себя");
        }

        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new InvalidCredentialsException("Текущий пользователь не найден"));
        User target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new InvalidCredentialsException("Целевой пользователь не найден"));

        target.getFollowers().add(follower);
        userRepository.save(target);
    }

    @Transactional
    public void unfollow(String followerUsername, String targetUsername) {
        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new InvalidCredentialsException("Текущий пользователь не найден"));
        User target = userRepository.findByUsername(targetUsername)
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

    private UserDto mapToDto(User user, User currentUser) {
        boolean isFollowing = currentUser != null && user.getFollowers().contains(currentUser);
        
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
                isFollowing
        );
    }

    private UserSummaryDto mapToSummaryDto(User user) {
        return new UserSummaryDto(
                user.getId(),
                user.getUsername(),
                user.getPositions(),
                user.getHeight(),
                userRepository.countFollowersByUserId(user.getId())
        );
    }
}
