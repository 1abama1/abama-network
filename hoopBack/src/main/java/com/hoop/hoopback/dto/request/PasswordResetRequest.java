package com.hoop.hoopback.dto.request;

import jakarta.validation.constraints.NotBlank;

public record PasswordResetRequest(
        String currentPassword,
        @NotBlank(message = "Новый пароль обязателен")
        String newPassword
) {}
