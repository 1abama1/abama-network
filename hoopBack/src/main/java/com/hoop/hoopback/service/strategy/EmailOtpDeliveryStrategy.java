package com.hoop.hoopback.service.strategy;

import com.hoop.hoopback.entity.User;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Service
@Primary
@RequiredArgsConstructor
@Slf4j
public class EmailOtpDeliveryStrategy implements OtpDeliveryStrategy {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    @org.springframework.scheduling.annotation.Async
    public void deliverOtp(User user, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            Context context = new Context(Locale.getDefault());
            context.setVariable("greeting", "Мяч в игре, " + user.getUsername() + "!");
            context.setVariable("otpCode", otpCode);

            String htmlContent = templateEngine.process("otp-email", context);

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Код подтверждения для HoopConnect");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("OTP код успешно отправлен на email: {}", user.getEmail());

        } catch (Exception e) {
            log.error("Ошибка при отправке OTP кода на email: {}", user.getEmail(), e);
            throw new RuntimeException("Не удалось отправить email с кодом подтверждения");
        }
    }
}
