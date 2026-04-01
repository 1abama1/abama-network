package com.hoop.hoopback.dto.messenger;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Клиент → сервер: отправка сообщения по WS */
public record SendMessageWsRequest(
    @NotBlank
    String targetUsername,

    @NotBlank
    @Size(max = 4000)
    String content,

    /** UUID, сгенерированный клиентом для deduplication */
    String clientTempId
) {}
