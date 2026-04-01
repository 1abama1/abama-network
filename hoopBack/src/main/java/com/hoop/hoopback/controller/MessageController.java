package com.hoop.hoopback.controller;

import com.hoop.hoopback.dto.messenger.ConversationDto;
import com.hoop.hoopback.dto.messenger.MessageDto;
import com.hoop.hoopback.service.messenger.MessageService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    /** GET /api/conversations — список диалогов */
    @GetMapping
    public ResponseEntity<List<ConversationDto>> getConversations(Authentication auth) {
        return ResponseEntity.ok(messageService.getConversations(auth.getName()));
    }

    /** GET /api/conversations/mutuals — список взаимных подписчиков */
    @GetMapping("/mutuals")
    public ResponseEntity<Object> getMutuals(Authentication auth) {
        return ResponseEntity.ok(messageService.getMutualFollowers(auth.getName()));
    }

    /**
     * GET /api/conversations/{id}/messages?before=<ISO>&limit=30
     * Cursor-based: возвращаем сообщения СТАРШЕ before.
     */
    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageDto>> getMessages(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant before,
            @RequestParam(defaultValue = "30") @Min(1) @Max(50) int limit,
            Authentication auth) {
        return ResponseEntity.ok(
                messageService.getMessages(auth.getName(), id, before, limit));
    }

    /** POST /api/conversations/{id}/messages — отправить сообщение через REST */
    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageDto> sendMessage(
            @PathVariable Long id,
            @RequestBody SendRequest req,
            Authentication auth) {
        return ResponseEntity.ok(
                messageService.sendMessageToConversation(
                        auth.getName(), id, req.content(), req.clientTempId()));
    }

    /**
     * POST /api/conversations/messages?receiver=username — отправить по имени
     * (создаёт диалог если нет)
     */
    @PostMapping("/messages")
    public ResponseEntity<MessageDto> sendMessageByUsername(
            @RequestParam String receiver,
            @RequestBody SendRequest req,
            Authentication auth) {
        return ResponseEntity.ok(
                messageService.sendMessage(
                        auth.getName(), receiver, req.content(), req.clientTempId()));
    }

    /** PUT /api/conversations/{id}/read — отметить всё прочитанным */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id, Authentication auth) {
        messageService.markConversationRead(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }

    /** DELETE /api/conversations/messages/{messageId} — soft delete */
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long messageId,
            Authentication auth) {
        messageService.deleteMessage(auth.getName(), messageId);
        return ResponseEntity.noContent().build();
    }

    record SendRequest(
            @NotBlank @Size(max = 4000) String content,
            String clientTempId) {
    }
}
