package com.hoop.hoopback.event;

import com.hoop.hoopback.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthEventListener {

    private final OtpService otpService;

    @EventListener
    @Async
    public void handleUserRegisteredEvent(UserRegisteredEvent event) {
        otpService.generateAndSendOtp(event.getUser());
    }
}
