package com.hoop.hoopback.dto.response;

import lombok.Builder;

@Builder
public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserSummaryDto user
) {}
