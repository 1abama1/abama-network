package com.hoop.hoopback.dto.messenger;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

/** Исходящее сообщение в WebSocket / REST */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MessageDto(
    Long id,
    Long conversationId,
    String senderUsername,
    String content,
    Instant sentAt,
    Instant readAt,
    /** true — оптимистичная заглушка клиента (id может быть temp) */
    boolean pending
) {
    public static MessageDto fromEntity(com.hoop.hoopback.entity.Message m) {
        return new MessageDto(
            m.getId(),
            m.getConversation().getId(),
            m.getSender().getUsername(),
            m.getContent(),
            m.getSentAt(),
            m.getReadAt(),
            false
        );
    }
}
