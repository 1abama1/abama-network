package com.hoop.hoopback.service.push;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketMessagePushService implements MessagePushService {

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void pushToUser(String username, String destination, Object payload) {
        messagingTemplate.convertAndSendToUser(username, destination, payload);
    }
}
