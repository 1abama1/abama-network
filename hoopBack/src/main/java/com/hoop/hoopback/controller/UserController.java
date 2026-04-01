package com.hoop.hoopback.controller;

import com.hoop.hoopback.dto.request.UpdateProfileRequest;
import com.hoop.hoopback.dto.response.UserDto;
import com.hoop.hoopback.dto.response.UserSummaryDto;
import com.hoop.hoopback.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile/{username}")
    public ResponseEntity<UserDto> getProfile(@PathVariable String username, Authentication authentication) {
        return ResponseEntity
                .ok(userService.getProfile(username, authentication != null ? authentication.getName() : null));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), request));
    }

    @PostMapping("/follow/{username}")
    public ResponseEntity<Void> follow(@PathVariable String username, Authentication authentication) {
        userService.follow(authentication.getName(), username);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/unfollow/{username}")
    public ResponseEntity<Void> unfollow(@PathVariable String username, Authentication authentication) {
        userService.unfollow(authentication.getName(), username);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/followers/{username}")
    public ResponseEntity<List<UserSummaryDto>> getFollowers(@PathVariable String username) {
        return ResponseEntity.ok(userService.getFollowers(username));
    }

    @GetMapping("/following/{username}")
    public ResponseEntity<List<UserSummaryDto>> getFollowing(@PathVariable String username) {
        return ResponseEntity.ok(userService.getFollowing(username));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserSummaryDto>> searchUsers(@RequestParam String q) {
        return ResponseEntity.ok(userService.searchUsers(q));
    }

    @GetMapping("/recommended")
    public ResponseEntity<List<UserSummaryDto>> getRecommendedUsers(Authentication authentication) {
        return ResponseEntity
                .ok(userService.getRecommendedUsers(authentication != null ? authentication.getName() : null));
    }
}
