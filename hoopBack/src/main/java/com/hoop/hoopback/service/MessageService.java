package com.hoop.hoopback.service;

import com.hoop.hoopback.dto.request.SendMessageRequest;
import com.hoop.hoopback.dto.response.ChatSummaryDto;
import com.hoop.hoopback.dto.response.MessageDto;
import com.hoop.hoopback.dto.response.UserSummaryDto;
import com.hoop.hoopback.entity.Message;
import com.hoop.hoopback.entity.User;
import com.hoop.hoopback.exception.InvalidCredentialsException;
import com.hoop.hoopback.repository.MessageRepository;
import com.hoop.hoopback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

        private final MessageRepository messageRepository;
        private final UserRepository userRepository;
        private final SimpMessagingTemplate messagingTemplate;

        @Transactional
        public MessageDto sendMessage(String senderUsername, String receiverUsername, SendMessageRequest request) {
                User sender = userRepository.findByUsername(senderUsername)
                                .orElseThrow(() -> new InvalidCredentialsException("Отправитель не найден"));
                User receiver = userRepository.findByUsername(receiverUsername)
                                .orElseThrow(() -> new InvalidCredentialsException("Получатель не найден"));

                if (!userRepository.isFollowing(receiver.getId(), sender.getId())) {
                        throw new IllegalArgumentException(
                                        "Вы можете писать только тем пользователям, на которых подписаны");
                }

                Message message = Message.builder()
                                .sender(sender)
                                .receiver(receiver)
                                .content(request.content())
                                .isRead(false)
                                .build();

                MessageDto dto = mapToDto(messageRepository.save(message));

                // Push to WebSocket
                messagingTemplate.convertAndSendToUser(receiver.getUsername(), "/queue/messages", dto);

                return dto;
        }

        @Transactional(readOnly = true)
        public Page<MessageDto> getConversation(String username, String otherUsername, Pageable pageable) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));
                User other = userRepository.findByUsername(otherUsername)
                                .orElseThrow(() -> new InvalidCredentialsException("Собеседник не найден"));

                return messageRepository.findConversation(user, other, pageable)
                                .map(this::mapToDto);
        }

        @Transactional(readOnly = true)
        public List<ChatSummaryDto> getChatList(String username) {
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new InvalidCredentialsException("Пользователь не найден"));

                return messageRepository.findLatestMessagesPerContact(user).stream()
                                .map(msg -> mapToChatSummaryDto(msg, username))
                                .collect(Collectors.toList());
        }

        private ChatSummaryDto mapToChatSummaryDto(Message message, String currentUsername) {
                String otherUsername = message.getSender().getUsername().equals(currentUsername)
                                ? message.getReceiver().getUsername()
                                : message.getSender().getUsername();

                return new ChatSummaryDto(
                                otherUsername,
                                message.getContent(),
                                message.getSentAt(),
                                0 // unreadCount calculation logic can be added later if needed
                );
        }

        @Transactional
        public void markAsRead(Long messageId, String username) {
                Message message = messageRepository.findById(messageId)
                                .orElseThrow(() -> new IllegalArgumentException("Сообщение не найдено"));

                if (!message.getReceiver().getUsername().equals(username)) {
                        throw new IllegalArgumentException("Вы не можете отметить чужое сообщение как прочитанное");
                }

                message.setRead(true);
                messageRepository.save(message);
        }

        private MessageDto mapToDto(Message message) {
                return new MessageDto(
                                message.getId(),
                                mapUserToSummaryDto(message.getSender()),
                                mapUserToSummaryDto(message.getReceiver()),
                                message.getContent(),
                                message.getSentAt(),
                                message.isRead());
        }

        private UserSummaryDto mapUserToSummaryDto(User user) {
                return new UserSummaryDto(
                                user.getId(),
                                user.getUsername(),
                                user.getPositions(),
                                user.getHeight(),
                                user.getFollowersCount() != null ? user.getFollowersCount() : 0);
        }
}
