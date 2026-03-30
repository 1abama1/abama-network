package com.hoop.hoopback.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record ResendOtpRequest(
        @NotBlank(message = "Email/Username обязателен")
        String identifier
) {}
