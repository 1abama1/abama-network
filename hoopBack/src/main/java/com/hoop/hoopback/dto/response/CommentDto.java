package com.hoop.hoopback.dto.response;

import java.time.LocalDateTime;

public record CommentDto(
    Long id,
    UserSummaryDto author,
    String content,
    LocalDateTime createdAt
) {}
