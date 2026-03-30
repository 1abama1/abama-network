package com.hoop.hoopback.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record ForgotPasswordRequest(
        @NotBlank(message = "Email обязателен")
        String email
) {}
