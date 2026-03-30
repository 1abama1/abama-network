package com.hoop.hoopback.service.strategy;

import com.hoop.hoopback.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ConsoleLogOtpStrategy implements OtpDeliveryStrategy {

    @Override
    public void deliverOtp(User user, String otpCode) {
        log.info("============================================");
        log.info("Отправка OTP кода пользователю: {}", user.getEmail());
        log.info("Ваш код подтверждения: {}", otpCode);
        log.info("============================================");
    }
}
