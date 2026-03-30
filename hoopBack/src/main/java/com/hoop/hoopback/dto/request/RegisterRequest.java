package com.hoop.hoopback.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record RegisterRequest(
        @NotBlank(message = "Username обязателен")
        String username,
        
        @NotBlank(message = "Email обязателен")
        @Email(message = "Некорректный формат email")
        String email,
        
        @NotBlank(message = "Пароль обязателен")
        String password
) {}
