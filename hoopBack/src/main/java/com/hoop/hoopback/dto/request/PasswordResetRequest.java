package com.hoop.hoopback.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record PasswordResetRequest(
        @NotBlank(message = "Новый пароль обязателен")
        String newPassword
) {}
