package com.hoop.hoopback.dto.response;

import lombok.Builder;

@Builder
public record MessageResponse(
        String message
) {}
