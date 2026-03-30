package com.hoop.hoopback.controller;

import com.hoop.hoopback.dto.request.SendMessageRequest;
import com.hoop.hoopback.dto.response.ChatSummaryDto;
import com.hoop.hoopback.dto.response.MessageDto;
import com.hoop.hoopback.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/{receiverUsername}")
    public ResponseEntity<MessageDto> sendMessage(
            @PathVariable String receiverUsername,
            @Valid @RequestBody SendMessageRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(messageService.sendMessage(authentication.getName(), receiverUsername, request));
    }

    @GetMapping("/{otherUsername}")
    public ResponseEntity<Page<MessageDto>> getConversation(
            @PathVariable String otherUsername,
            @PageableDefault(size = 50) Pageable pageable,
            Authentication authentication
    ) {
        return ResponseEntity.ok(messageService.getConversation(authentication.getName(), otherUsername, pageable));
    }

    @GetMapping("/chats")
    public ResponseEntity<List<ChatSummaryDto>> getChatList(Authentication authentication) {
        return ResponseEntity.ok(messageService.getChatList(authentication.getName()));
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long messageId, Authentication authentication) {
        messageService.markAsRead(messageId, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
