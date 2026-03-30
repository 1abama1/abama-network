package com.hoop.hoopback.dto.response;

import java.time.LocalDateTime;

public record MessageDto(
    Long id,
    UserSummaryDto sender,
    UserSummaryDto receiver,
    String content,
    LocalDateTime sentAt,
    boolean isRead
) {}
