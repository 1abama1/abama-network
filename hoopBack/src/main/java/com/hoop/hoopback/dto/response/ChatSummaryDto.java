package com.hoop.hoopback.dto.response;

import java.time.LocalDateTime;

public record ChatSummaryDto(
    String otherUsername,
    String lastMessage,
    LocalDateTime lastMessageTime,
    int unreadCount
) {}
