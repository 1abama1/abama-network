package com.hoop.hoopback.controller;

import com.hoop.hoopback.dto.request.CreateGameRequest;
import com.hoop.hoopback.dto.response.GameDto;
import com.hoop.hoopback.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @PostMapping
    public ResponseEntity<GameDto> createGame(
            @Valid @RequestBody CreateGameRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(gameService.createGame(authentication.getName(), request));
    }

    @PostMapping("/{gameId}/register")
    public ResponseEntity<Void> registerForGame(@PathVariable Long gameId, Authentication authentication) {
        gameService.registerForGame(authentication.getName(), gameId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{gameId}/register")
    public ResponseEntity<Void> unregisterFromGame(@PathVariable Long gameId, Authentication authentication) {
        gameService.unregisterFromGame(authentication.getName(), gameId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<GameDto>> getUpcomingGames(Authentication authentication) {
        return ResponseEntity.ok(gameService.getUpcomingGames(authentication != null ? authentication.getName() : null));
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<GameDto> getGameDetails(@PathVariable Long gameId, Authentication authentication) {
        return ResponseEntity.ok(gameService.getGameDetails(gameId, authentication != null ? authentication.getName() : null));
    }
}
