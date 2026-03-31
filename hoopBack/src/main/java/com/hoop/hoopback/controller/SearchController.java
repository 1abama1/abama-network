package com.hoop.hoopback.controller;

import com.hoop.hoopback.dto.response.PostDto;
import com.hoop.hoopback.dto.response.UnifiedSearchResponse;
import com.hoop.hoopback.service.GameService;
import com.hoop.hoopback.service.PostService;
import com.hoop.hoopback.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final UserService userService;
    private final PostService postService;
    private final GameService gameService;

    @GetMapping("/top")
    public ResponseEntity<UnifiedSearchResponse> getTopResults(
            @RequestParam String q,
            Authentication authentication
    ) {
        String currentUsername = authentication != null ? authentication.getName() : null;

        // Fetch top matching users
        var users = userService.searchUsers(q).stream()
                .limit(5)
                .collect(Collectors.toList());

        // Fetch top matching posts
        var posts = postService.searchPosts(q, currentUsername, PageRequest.of(0, 5))
                .getContent();

        // Fetch top matching games
        var games = gameService.searchGames(q, currentUsername).stream()
                .limit(3)
                .collect(Collectors.toList());

        return ResponseEntity.ok(UnifiedSearchResponse.builder()
                .users(users)
                .posts(posts)
                .games(games)
                .build());
    }
}
