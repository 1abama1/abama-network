package com.hoop.hoopback.service;

import com.hoop.hoopback.dto.request.CreateGameRequest;
import com.hoop.hoopback.dto.response.GameDto;
import com.hoop.hoopback.dto.response.UserSummaryDto;
import com.hoop.hoopback.entity.Game;
import com.hoop.hoopback.entity.GameRegistration;
import com.hoop.hoopback.entity.User;
import com.hoop.hoopback.exception.InvalidCredentialsException;
import com.hoop.hoopback.repository.GameRegistrationRepository;
import com.hoop.hoopback.repository.GameRepository;
import com.hoop.hoopback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GameService {

        private final GameRepository gameRepository;
        private final GameRegistrationRepository gameRegistrationRepository;
        private final UserRepository userRepository;

        @Transactional
        @CacheEvict(value = "games", allEntries = true)
        public GameDto createGame(String username, CreateGameRequest request) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));

                Game game = Game.builder()
                                .creator(user)
                                .title(request.title())
                                .description(request.description())
                                .location(request.location())
                                .dateTime(request.dateTime())
                                .minPlayers(request.minPlayers())
                                .maxPlayers(request.maxPlayers())
                                .build();

                return mapToDto(gameRepository.save(game), user);
        }

        @Transactional
        @CacheEvict(value = "games", allEntries = true)
        public void registerForGame(String username, Long gameId) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));
                Game game = gameRepository.findById(gameId)
                                .orElseThrow(() -> new IllegalArgumentException("Игра не найдена"));

                if (gameRegistrationRepository.existsByUserAndGame(user, game)) {
                        throw new IllegalArgumentException("Вы уже записаны на эту игру");
                }

                if (gameRegistrationRepository.countByGame(game) >= game.getMaxPlayers()) {
                        throw new IllegalArgumentException("На игру больше нет мест");
                }

                GameRegistration registration = GameRegistration.builder()
                                .user(user)
                                .game(game)
                                .build();

                gameRegistrationRepository.save(registration);
        }

        @Transactional
        public void unregisterFromGame(String username, Long gameId) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));
                Game game = gameRepository.findById(gameId)
                                .orElseThrow(() -> new IllegalArgumentException("Игра не найдена"));

                gameRegistrationRepository.findByUserAndGame(user, game)
                                .ifPresent(gameRegistrationRepository::delete);
        }

        @Transactional(readOnly = true)
        @Cacheable(value = "games", key = "'upcoming:' + #currentUsername")
        public List<GameDto> getUpcomingGames(String currentUsername) {
                User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null)
                                : null;
                return gameRepository.findAllByDateTimeAfterOrderByDateTimeAsc(LocalDateTime.now()).stream()
                                .map(game -> mapToDto(game, currentUser))
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public GameDto getGameDetails(Long gameId, String currentUsername) {
                Game game = gameRepository.findById(gameId)
                                .orElseThrow(() -> new IllegalArgumentException("Игра не найдена"));
                User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null)
                                : null;
                return mapToDto(game, currentUser);
        }

        @Transactional(readOnly = true)
        public List<GameDto> searchGames(String q, String currentUsername) {
                User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null)
                                : null;
                return gameRepository
                                .findAllByTitleContainingIgnoreCaseOrLocationContainingIgnoreCaseOrderByDateTimeAsc(q,
                                                q)
                                .stream()
                                .map(game -> mapToDto(game, currentUser))
                                .collect(Collectors.toList());
        }

        private GameDto mapToDto(Game game, User currentUser) {
                boolean isRegistered = currentUser != null
                                && gameRegistrationRepository.existsByUserAndGame(currentUser, game);
                List<UserSummaryDto> players = game.getRegistrations().stream()
                                .map(reg -> mapUserToSummaryDto(reg.getUser()))
                                .collect(Collectors.toList());

                return new GameDto(
                                game.getId(),
                                mapUserToSummaryDto(game.getCreator()),
                                game.getTitle(),
                                game.getDescription(),
                                game.getLocation(),
                                game.getDateTime(),
                                game.getMinPlayers(),
                                game.getMaxPlayers(),
                                players.size(),
                                players,
                                isRegistered);
        }

        private UserSummaryDto mapUserToSummaryDto(User user) {
                return new UserSummaryDto(
                                user.getId(),
                                user.getUsername(),
                                user.getPositions() != null ? new java.util.HashSet<>(user.getPositions()) : null,
                                user.getHeight(),
                                user.getFollowersCount() != null ? user.getFollowersCount() : 0);
        }
}
