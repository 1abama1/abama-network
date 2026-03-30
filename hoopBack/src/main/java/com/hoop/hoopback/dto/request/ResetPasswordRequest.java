package com.hoop.hoopback.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record ResetPasswordRequest(
        @NotBlank(message = "Email/Username обязателен")
        String identifier,
        
        @NotBlank(message = "OTP код обязателен")
        String code,
        
        @NotBlank(message = "Новый пароль обязателен")
        String newPassword
) {}
