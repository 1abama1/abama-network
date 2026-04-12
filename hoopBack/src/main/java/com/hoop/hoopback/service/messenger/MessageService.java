package com.hoop.hoopback.service.messenger;

import com.hoop.hoopback.dto.messenger.*;
import com.hoop.hoopback.dto.response.UserSummaryDto;
import com.hoop.hoopback.entity.Conversation;
import com.hoop.hoopback.entity.Message;
import com.hoop.hoopback.entity.User;
import com.hoop.hoopback.exception.ResourceNotFoundException;
import com.hoop.hoopback.exception.UnauthorizedOperationException;
import com.hoop.hoopback.mapper.UserMapper;
import com.hoop.hoopback.repository.ConversationRepository;
import com.hoop.hoopback.repository.MessageRepository;
import com.hoop.hoopback.repository.UserRepository;
import com.hoop.hoopback.service.push.MessagePushService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepo;
    private final ConversationRepository convRepo;
    private final UserRepository userRepo;
    private final UserMapper userMapper;
    private final MessagePushService pushService;
    private final PresenceService presence;
    private final UnreadCounterService unreadCounter;

    @Transactional(readOnly = true)
    public List<ConversationDto> getConversations(String username) {
        User me = findUser(username);
        List<Conversation> convs = convRepo.findAllByUser(me);

        Set<String> partnerNames = convs.stream()
                .map(c -> c.partnerFor(me).getUsername())
                .collect(Collectors.toSet());
        Set<String> onlineSet = presence.getOnlineFrom(partnerNames);

        return convs.stream().map(conv -> {
            User partner = conv.partnerFor(me);
            var last = messageRepo.findLastByConversation(conv);
            int unread = unreadCounter.getCount(me.getId(), conv.getId());

            return new ConversationDto(
                    conv.getId(),
                    partner.getUsername(),
                    last.map(Message::getContent).orElse(null),
                    last.map(Message::getSentAt).orElse(null),
                    unread,
                    onlineSet.contains(partner.getUsername()));
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<MessageDto> getMessages(String username, Long conversationId, Instant before, int limit) {
        User me = findUser(username);
        Conversation conv = findConversation(conversationId, me);
        int safeLimit = Math.min(limit, 50);

        List<Message> msgs;
        if (before == null) {
            msgs = messageRepo.findTop50ByConversationAndDeletedAtIsNullOrderBySentAtDesc(conv, PageRequest.of(0, safeLimit));
        } else {
            msgs = messageRepo.findTop50ByConversationAndDeletedAtIsNullAndSentAtBeforeOrderBySentAtDesc(conv, before, PageRequest.of(0, safeLimit));
        }

        return msgs.stream()
                .map(MessageDto::fromEntity)
                .collect(Collectors.collectingAndThen(Collectors.toList(), list -> {
                    Collections.reverse(list);
                    return list;
                }));
    }

    @Transactional
    public MessageDto sendMessage(String senderUsername, String receiverUsername, String content, String clientTempId) {
        User sender = findUser(senderUsername);
        User receiver = findUser(receiverUsername);

        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("Cannot message yourself");
        }

        Conversation conv = convRepo.findByParticipants(sender, receiver)
                .orElseGet(() -> convRepo.save(
                        Conversation.builder()
                                .userA(sender)
                                .userB(receiver)
                                .build()));

        return saveAndNotify(sender, receiver, conv, content, clientTempId);
    }

    @Transactional
    public MessageDto sendMessageToConversation(String senderUsername, Long conversationId, String content,
            String clientTempId) {
        User sender = findUser(senderUsername);
        Conversation conv = convRepo.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        User receiver = conv.partnerFor(sender);
        return saveAndNotify(sender, receiver, conv, content, clientTempId);
    }

    private MessageDto saveAndNotify(User sender, User receiver, Conversation conv, String content,
            String clientTempId) {
        Message msg = messageRepo.save(
                Message.builder()
                        .conversation(conv)
                        .sender(sender)
                        .content(content)
                        .build());

        unreadCounter.increment(receiver.getId(), conv.getId());

        MessageDto dto = MessageDto.fromEntity(msg);
        pushService.pushToUser(receiver.getUsername(), "/queue/messages", dto);

        if (clientTempId != null) {
            pushService.pushToUser(sender.getUsername(), "/queue/message-ack",
                    new MessageAckEvent(clientTempId, msg.getId(), msg.getSentAt()));
        }

        return dto;
    }

    @Transactional
    public void markConversationRead(String username, Long conversationId) {
        User me = findUser(username);
        Conversation conv = findConversation(conversationId, me);

        int updated = messageRepo.markAllRead(conv, me, Instant.now());
        unreadCounter.reset(me.getId(), conv.getId());

        if (updated > 0) {
            User partner = conv.partnerFor(me);
            pushService.pushToUser(partner.getUsername(), "/queue/read-receipt",
                    new ReadReceiptEvent(conversationId, me.getUsername(), Instant.now()));
        }
    }

    @Transactional
    public void deleteMessage(String username, Long messageId) {
        User me = findUser(username);
        Message m = messageRepo.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!m.getSender().getId().equals(me.getId())) {
            throw new UnauthorizedOperationException("Cannot delete someone else's message");
        }
        if (m.isDeleted())
            return;

        m.setDeletedAt(Instant.now());
        messageRepo.save(m);

        User partner = m.getConversation().partnerFor(me);
        pushService.pushToUser(partner.getUsername(), "/queue/message-deleted",
                new MessageDeletedEvent(messageId, m.getConversation().getId()));
    }

    @Transactional(readOnly = true)
    public List<UserSummaryDto> getMutualFollowers(String username) {
        User me = findUser(username);
        return userRepo.findMutualFollowers(me.getId()).stream()
                .map(userMapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    public String getPartnerUsername(Long conversationId, String myUsername) {
        User me = findUser(myUsername);
        Conversation conv = findConversation(conversationId, me);
        return conv.partnerFor(me).getUsername();
    }

    private User findUser(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private Conversation findConversation(Long id, User me) {
        Conversation conv = convRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        if (!conv.getUserA().getId().equals(me.getId()) && !conv.getUserB().getId().equals(me.getId())) {
            throw new UnauthorizedOperationException("Access denied to conversation");
        }
        return conv;
    }
}
