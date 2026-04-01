package com.hoop.hoopback.dto.response;

import com.hoop.hoopback.entity.NotificationType;
import java.time.LocalDateTime;

public record NotificationDto(
        Long id,
        NotificationType type,
        UserSummaryDto actor,
        Long entityId,
        String entityType,
        boolean isRead,
        LocalDateTime createdAt) {
}
