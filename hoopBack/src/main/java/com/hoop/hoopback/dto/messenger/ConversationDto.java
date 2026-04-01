package com.hoop.hoopback.dto.messenger;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

/** Превью диалога в списке чатов */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConversationDto(
    Long id,
    String partnerUsername,
    String lastMessage,
    Instant lastMessageAt,
    int unreadCount,
    boolean partnerOnline
) {}
