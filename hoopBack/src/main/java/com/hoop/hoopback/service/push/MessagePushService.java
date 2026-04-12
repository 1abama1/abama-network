package com.hoop.hoopback.service.push;

public interface MessagePushService {
    void pushToUser(String username, String destination, Object payload);
}
