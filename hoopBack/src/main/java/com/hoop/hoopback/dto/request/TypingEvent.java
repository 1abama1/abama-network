package com.hoop.hoopback.dto.request;

public record TypingEvent(
        String senderUsername,
        String receiverUsername,
        boolean isTyping) {
}
