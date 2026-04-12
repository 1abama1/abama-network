package com.hoop.hoopback.service;

import com.hoop.hoopback.dto.request.*;
import com.hoop.hoopback.dto.response.AuthResponse;
import com.hoop.hoopback.dto.response.MessageResponse;
import com.hoop.hoopback.dto.response.UserSummaryDto;
import com.hoop.hoopback.entity.Role;
import com.hoop.hoopback.entity.User;
import com.hoop.hoopback.event.UserRegisteredEvent;
import com.hoop.hoopback.exception.InvalidCredentialsException;
import com.hoop.hoopback.exception.ResourceNotFoundException;
import com.hoop.hoopback.exception.TokenRefreshException;
import com.hoop.hoopback.exception.UserAlreadyExistsException;
import com.hoop.hoopback.repository.UserRepository;
import com.hoop.hoopback.security.JwtService;
import com.hoop.hoopback.security.SecurityUserAdapter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
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
    private final ApplicationEventPublisher eventPublisher;
    private final OtpService otpService;
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
                .isEnabled(false) // Ждем подтверждения OTP
                .build();

        userRepository.save(user);

        // Публикуем событие
        eventPublisher.publishEvent(new UserRegisteredEvent(this, user));

        return MessageResponse.builder()
                .message("Пользователь успешно зарегистрирован. OTP код отправлен.")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.identifier())
                .orElseGet(() -> userRepository.findByUsernameIgnoreCase(request.identifier())
                        .orElseThrow(() -> new InvalidCredentialsException("Неверные учетные данные")));

        if (!user.isEnabled()) {
            throw new InvalidCredentialsException("Аккаунт не подтвержден. Пожалуйста, подтвердите OTP код.");
        }

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

    public MessageResponse verifyOtp(String identifier, String code) {
        otpService.verifyOtp(identifier, code);
        return MessageResponse.builder()
                .message("Аккаунт успешно подтвержден!")
                .build();
    }

    public MessageResponse resendOtp(String identifier) {
        otpService.resendOtp(identifier);
        return MessageResponse.builder()
                .message("Новый OTP код отправлен.")
                .build();
    }

    @Transactional
    public MessageResponse requestForgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь с таким email не найден"));
        
        otpService.generateAndSendOtp(user);
        
        return MessageResponse.builder()
                .message("Код для сброса пароля отправлен на ваш email.")
                .build();
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        // Проверяем OTP
        otpService.verifyOtp(request.identifier(), request.code());
        
        // После успешной верификации
        User user = userRepository.findByEmail(request.identifier())
                .orElseGet(() -> userRepository.findByUsernameIgnoreCase(request.identifier())
                        .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден")));
        
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        
        return MessageResponse.builder()
                .message("Пароль успешно изменен.")
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
