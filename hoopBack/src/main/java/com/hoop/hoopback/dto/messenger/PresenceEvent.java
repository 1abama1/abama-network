package com.hoop.hoopback.dto.messenger;

/** Сервер → клиент: изменение статуса присутствия */
public record PresenceEvent(
    String username,
    boolean online
) {}
