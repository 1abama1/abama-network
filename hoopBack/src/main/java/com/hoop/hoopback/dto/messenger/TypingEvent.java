package com.hoop.hoopback.dto.messenger;

/** Сервер → клиент: typing indicator */
public record TypingEvent(
    String senderUsername,
    Long conversationId,
    boolean typing
) {}
