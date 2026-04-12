package com.hoop.hoopback.service;

import com.hoop.hoopback.dto.request.CreateGameRequest;
import com.hoop.hoopback.dto.response.GameDto;
import com.hoop.hoopback.entity.Game;
import com.hoop.hoopback.entity.GameRegistration;
import com.hoop.hoopback.entity.User;
import com.hoop.hoopback.exception.*;
import com.hoop.hoopback.mapper.UserMapper;
import com.hoop.hoopback.repository.GameRegistrationRepository;
import com.hoop.hoopback.repository.GameRepository;
import com.hoop.hoopback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
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
    private final UserMapper userMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    @CacheEvict(value = "games", allEntries = true)
    public GameDto createGame(String username, CreateGameRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

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
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Игра не найдена"));

        if (gameRegistrationRepository.existsByUserAndGame(user, game)) {
            throw new DuplicateResourceException("Вы уже записаны на эту игру");
        }

        if (gameRegistrationRepository.countByGame(game) >= game.getMaxPlayers()) {
            throw new GameFullException("На игру больше нет мест");
        }

        GameRegistration registration = GameRegistration.builder()
                .user(user)
                .game(game)
                .build();

        gameRegistrationRepository.save(registration);

        eventPublisher.publishEvent(new com.hoop.hoopback.event.GameRegisteredEvent(this, user, game.getCreator(), game.getId()));
    }

    @Transactional
    public void unregisterFromGame(String username, Long gameId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Игра не найдена"));

        gameRegistrationRepository.findByUserAndGame(user, game)
                .ifPresent(gameRegistrationRepository::delete);
    }

    @Transactional
    @CacheEvict(value = "games", key = "'upcoming:' + #username")
    public GameDto updateGame(Long id, CreateGameRequest request, String username) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Игра не найдена"));

        if (!game.getCreator().getUsername().equals(username)) {
            throw new UnauthorizedOperationException("У вас нет прав на редактирование этой игры");
        }

        game.setTitle(request.title());
        game.setDescription(request.description());
        game.setLocation(request.location());
        game.setDateTime(request.dateTime());
        game.setMinPlayers(request.minPlayers());
        game.setMaxPlayers(request.maxPlayers());

        return mapToDto(gameRepository.save(game), game.getCreator());
    }

    @Transactional
    @CacheEvict(value = "games", allEntries = true)
    public void deleteGame(Long id, String username) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Игра не найдена"));

        if (!game.getCreator().getUsername().equals(username)) {
            throw new UnauthorizedOperationException("У вас нет прав на удаление этой игры");
        }

        gameRepository.delete(game);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "games", key = "'upcoming:' + #currentUsername")
    public List<GameDto> getUpcomingGames(String currentUsername) {
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        return gameRepository.findAllByDateTimeAfterOrderByDateTimeAsc(LocalDateTime.now()).stream()
                .map(game -> mapToDto(game, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GameDto getGameDetails(Long gameId, String currentUsername) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Игра не найдена"));
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        return mapToDto(game, currentUser);
    }

    @Transactional(readOnly = true)
    public List<GameDto> searchGames(String q, String currentUsername) {
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        return gameRepository
                .findAllByTitleContainingIgnoreCaseOrLocationContainingIgnoreCaseOrderByDateTimeAsc(q, q)
                .stream()
                .map(game -> mapToDto(game, currentUser))
                .collect(Collectors.toList());
    }

    public List<GameDto> getTrendingGames(String currentUsername) {
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        return gameRepository.findTrendingGames(LocalDateTime.now(), PageRequest.of(0, 3)).stream()
                .map(game -> mapToDto(game, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GameDto> getGamesByUsername(String username, String currentUsername) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));
        User currentUser = currentUsername != null ? userRepository.findByUsername(currentUsername).orElse(null) : null;
        return gameRegistrationRepository.findAllByUserOrderByRegisteredAtDesc(user).stream()
                .map(reg -> mapToDto(reg.getGame(), currentUser))
                .collect(Collectors.toList());
    }

    private GameDto mapToDto(Game game, User currentUser) {
        boolean isRegistered = currentUser != null
                && gameRegistrationRepository.existsByUserAndGame(currentUser, game);
        var players = game.getRegistrations().stream()
                .map(reg -> userMapper.toSummaryDto(reg.getUser()))
                .collect(Collectors.toList());

        return new GameDto(
                game.getId(),
                userMapper.toSummaryDto(game.getCreator()),
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
}
