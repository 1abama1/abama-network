package com.hoop.hoopback.dto.messenger;

import java.time.Instant;

/** Сервер → клиент: подтверждение прочтения */
public record ReadReceiptEvent(
    Long conversationId,
    String readerUsername,
    Instant readAt
) {}
