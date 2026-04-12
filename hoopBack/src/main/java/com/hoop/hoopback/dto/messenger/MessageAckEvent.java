package com.hoop.hoopback.dto.messenger;

import java.time.Instant;

public record MessageAckEvent(String clientTempId, Long serverId, Instant sentAt) {}
