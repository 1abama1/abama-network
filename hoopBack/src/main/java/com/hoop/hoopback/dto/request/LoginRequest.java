package com.hoop.hoopback.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record LoginRequest(
        @NotBlank(message = "Email/Username обязателен")
        String identifier,
        
        @NotBlank(message = "Пароль обязателен")
        String password
) {}
