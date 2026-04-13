package com.hoop.hoopback.service;

import com.hoop.hoopback.dto.request.LoginRequest;
import com.hoop.hoopback.dto.request.PasswordResetRequest;
import com.hoop.hoopback.dto.request.RegisterRequest;
import com.hoop.hoopback.dto.response.AuthResponse;
import com.hoop.hoopback.dto.response.MessageResponse;
import com.hoop.hoopback.dto.response.UserSummaryDto;
import com.hoop.hoopback.entity.Role;
import com.hoop.hoopback.entity.User;
import com.hoop.hoopback.exception.InvalidCredentialsException;
import com.hoop.hoopback.exception.ResourceNotFoundException;
import com.hoop.hoopback.exception.TokenRefreshException;
import com.hoop.hoopback.exception.UserAlreadyExistsException;
import com.hoop.hoopback.repository.UserRepository;
import com.hoop.hoopback.security.JwtService;
import com.hoop.hoopback.security.SecurityUserAdapter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final TokenBlacklistService tokenBlacklistService;

    @Transactional
    public MessageResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("Пользователь с таким email уже существует");
        }
        if (userRepository.existsByUsernameIgnoreCase(request.username())) {
            throw new UserAlreadyExistsException("Пользователь с таким именем уже существует");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .isEnabled(true)
                .build();

        userRepository.save(user);

        return MessageResponse.builder()
                .message("Пользователь успешно зарегистрирован.")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.identifier())
                .orElseGet(() -> userRepository.findByUsernameIgnoreCase(request.identifier())
                        .orElseThrow(() -> new InvalidCredentialsException("Неверные учетные данные")));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.password())
        );

        String jwtToken = jwtService.generateToken(new SecurityUserAdapter(user));
        String refreshToken = jwtService.generateRefreshToken(new SecurityUserAdapter(user));

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .user(new UserSummaryDto(
                        user.getId(),
                        user.getUsername(),
                        user.getPositions(),
                        user.getHeight(),
                        user.getFollowersCount() != null ? user.getFollowersCount() : 0L,
                        user.getBio()
                ))
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        final String identifier;
        try {
            identifier = jwtService.extractUsername(refreshToken);
        } catch (Exception e) {
            throw new TokenRefreshException("Неверный refresh токен: " + e.getMessage());
        }

        if (identifier != null) {
            var userDetails = userRepository.findByEmail(identifier)
                    .orElseGet(() -> userRepository.findByUsernameIgnoreCase(identifier)
                    .orElseThrow(() -> new TokenRefreshException("Пользователь не найден")));

            SecurityUserAdapter adapter = new SecurityUserAdapter(userDetails);
            if (jwtService.isTokenValid(refreshToken, adapter)) {
                String accessToken = jwtService.generateToken(adapter);
                return AuthResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .user(new UserSummaryDto(
                                userDetails.getId(),
                                userDetails.getUsername(),
                                userDetails.getPositions(),
                                userDetails.getHeight(),
                                userDetails.getFollowersCount() != null ? userDetails.getFollowersCount() : 0L,
                                userDetails.getBio()
                        ))
                        .build();
            }
        }
        throw new TokenRefreshException("Недействительный refresh токен");
    }

    @Transactional
    public MessageResponse changePassword(String currentUsername, PasswordResetRequest request) {
        User user = userRepository.findByUsernameIgnoreCase(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

        if (request.currentPassword() != null &&
                !passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Неверный текущий пароль");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        return MessageResponse.builder()
                .message("Пароль успешно изменен")
                .build();
    }

    public MessageResponse logout(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            String jti = jwtService.extractJti(jwt);
            Date exp  = jwtService.extractExpiration(jwt);
            tokenBlacklistService.blacklist(jti, exp);
        }
        return MessageResponse.builder().message("Logged out").build();
    }
}
