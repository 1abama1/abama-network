package com.hoop.hoopback.service.strategy;

import com.hoop.hoopback.entity.User;

public interface OtpDeliveryStrategy {
    void deliverOtp(User user, String otpCode);
}
