package com.hoop.hoopback.controller;

import com.hoop.hoopback.dto.messenger.SendMessageWsRequest;
import com.hoop.hoopback.service.messenger.MessageService;
import com.hoop.hoopback.service.messenger.PresenceService;
import com.hoop.hoopback.service.messenger.TypingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketMessengerController {

    private final MessageService messageService;
    private final PresenceService presenceService;
    private final TypingService typingService;

    // ─── Presence ─────────────────────────────────────────────────────────────

    @EventListener
    public void onConnect(SessionConnectedEvent event) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
        String username = extractUsername(sha);
        if (username != null) {
            presenceService.markOnline(username);
            log.debug("WS connected: {}", username);
        }
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
        String username = extractUsername(sha);
        if (username != null) {
            presenceService.markOffline(username);
            typingService.clearAll(username); // убираем все typing-индикаторы
            log.debug("WS disconnected: {}", username);
        }
    }

    // ─── Messaging ────────────────────────────────────────────────────────────

    /**
     * Клиент публикует в /app/message.send
     * Результат доставляется через convertAndSendToUser — не через @SendToUser,
     * чтобы sender тоже получил подтверждение (ACK с serverId).
     */
    @MessageMapping("/message.send")
    public void sendMessage(@Valid @Payload SendMessageWsRequest req,
            Principal principal) {
        messageService.sendMessage(
                principal.getName(),
                req.targetUsername(),
                req.content(),
                req.clientTempId());
    }

    // ─── Typing ───────────────────────────────────────────────────────────────

    /** /app/typing.start payload: { conversationId } */
    @MessageMapping("/typing.start")
    public void startTyping(@Payload TypingPayload payload, Principal principal) {
        String partner = messageService.getPartnerUsername(payload.conversationId(), principal.getName());
        typingService.startTyping(principal.getName(), payload.conversationId(), partner);
    }

    /** /app/typing.stop payload: { conversationId } */
    @MessageMapping("/typing.stop")
    public void stopTyping(@Payload TypingPayload payload, Principal principal) {
        String partner = messageService.getPartnerUsername(payload.conversationId(), principal.getName());
        typingService.stopTyping(principal.getName(), payload.conversationId(), partner);
    }

    // ─── Heartbeat для presence ───────────────────────────────────────────────

    /** /app/presence.ping — клиент шлёт каждые 30 сек */
    @MessageMapping("/presence.ping")
    public void presencePing(Principal principal) {
        presenceService.markOnline(principal.getName());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String extractUsername(StompHeaderAccessor sha) {
        var user = sha.getUser();
        return user != null ? user.getName() : null;
    }

    record TypingPayload(Long conversationId) {
    }
}
