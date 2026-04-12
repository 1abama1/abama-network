package com.hoop.hoopback.service;

import com.hoop.hoopback.dto.response.UnifiedSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final UserService userService;
    private final PostService postService;
    private final GameService gameService;

    public UnifiedSearchResponse searchTop(String query, String currentUsername) {
        var users = userService.searchUsers(query).stream()
                .limit(5)
                .collect(Collectors.toList());

        var posts = postService.searchPosts(query, currentUsername, PageRequest.of(0, 5))
                .getContent();

        var games = gameService.searchGames(query, currentUsername).stream()
                .limit(3)
                .collect(Collectors.toList());

        return new UnifiedSearchResponse(users, posts, games);
    }
}
