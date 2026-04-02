package com.hoop.hoopback.service;

import com.hoop.hoopback.dto.response.NotificationDto;
import com.hoop.hoopback.dto.response.UserSummaryDto;
import com.hoop.hoopback.entity.Notification;
import com.hoop.hoopback.entity.NotificationType;
import com.hoop.hoopback.entity.User;
import com.hoop.hoopback.exception.InvalidCredentialsException;
import com.hoop.hoopback.repository.NotificationRepository;
import com.hoop.hoopback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Async
    @Transactional
    public void notify(User recipient, User actor, NotificationType type, Long entityId, String entityType) {
        // Don't notify yourself
        if (recipient.getId().equals(actor.getId())) {
            return;
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .entityId(entityId)
                .entityType(entityType)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Real-time push via WebSocket
        NotificationDto dto = mapToDto(saved);
        messagingTemplate.convertAndSendToUser(
                recipient.getUsername(),
                "/queue/notifications",
                dto);
        log.info("Notification sent to user {}: {}", recipient.getUsername(), type);
    }

    @Transactional(readOnly = true)
    public Page<NotificationDto> getNotifications(String username, Pageable pageable) {
        User user = findUser(username);
        return notificationRepository
                .findAllByRecipientOrderByCreatedAtDesc(user, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String username) {
        return notificationRepository.countByRecipientAndIsReadFalse(findUser(username));
    }

    @Transactional
    public void markAllRead(String username) {
        notificationRepository.markAllReadByRecipient(findUser(username));
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));
    }

    private NotificationDto mapToDto(Notification n) {
        UserSummaryDto actor = n.getActor() == null ? null
                : new UserSummaryDto(
                        n.getActor().getId(),
                        n.getActor().getUsername(),
                        n.getActor().getPositions(),
                        n.getActor().getHeight(),
                        n.getActor().getFollowersCount() != null ? n.getActor().getFollowersCount() : 0,
                        n.getActor().getBio());
        return new NotificationDto(
                n.getId(),
                n.getType(),
                actor,
                n.getEntityId(),
                n.getEntityType(),
                n.isRead(),
                n.getCreatedAt());
    }
}
