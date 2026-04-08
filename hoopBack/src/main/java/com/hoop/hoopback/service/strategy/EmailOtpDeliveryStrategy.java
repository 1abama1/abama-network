package com.hoop.hoopback.service.strategy;

import com.hoop.hoopback.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@Primary
@RequiredArgsConstructor
@Slf4j
public class EmailOtpDeliveryStrategy implements OtpDeliveryStrategy {

    private final JavaMailSender mailSender;

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

            String htmlContent = generateHtmlTemplate(user.getUsername(), otpCode);

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Код подтверждения для HoopConnect");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("OTP код успешно отправлен на email: {}", user.getEmail());

        } catch (MessagingException e) {
            log.error("Ошибка при отправке OTP кода на email: {}", user.getEmail(), e);
            throw new RuntimeException("Не удалось отправить email с кодом подтверждения");
        }
    }

    private String generateHtmlTemplate(String username, String otpCode) {
        // NOTE: Do NOT use String.formatted() or String.format() here.
        // CSS properties like rgba(), radial-gradient() and percentage values
        // contain '%' characters that would be misinterpreted as format specifiers,
        // causing UnknownFormatConversionException at runtime.
        // Use simple .replace() with named placeholders instead.
        String template = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: 'Black Ops One', 'Impact', 'Arial Black', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                            background-color: #1a1a1a;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            background: #ffffff;
                            border-radius: 20px;
                            overflow: hidden;
                            border: 4px solid #ff6b00;
                            box-shadow: 0 15px 35px rgba(255,107,0,0.2);
                        }
                        .header {
                            background: radial-gradient(circle at 2px 2px, #e65c00 1px, transparent 0) 0 0 / 4px 4px, #ff6b00;
                            color: #ffffff;
                            padding: 40px 20px;
                            text-align: center;
                            border-bottom: 6px solid #1a1a1a;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 36px;
                            text-transform: uppercase;
                            letter-spacing: 3px;
                            text-shadow: 2px 2px 0px #1a1a1a;
                        }
                        .content {
                            padding: 40px 30px;
                            text-align: center;
                            background-image: linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9));
                        }
                        .greeting {
                            font-size: 22px;
                            font-weight: 800;
                            margin-bottom: 20px;
                            color: #1a1a1a;
                            text-transform: uppercase;
                        }
                        .message {
                            font-size: 16px;
                            color: #444;
                            margin-bottom: 30px;
                            font-family: 'Segoe UI', sans-serif;
                        }
                        .otp-box {
                            background-color: #000;
                            border: 4px solid #333;
                            border-radius: 10px;
                            padding: 25px;
                            margin: 20px 0;
                            display: inline-block;
                            box-shadow: inset 0 0 15px #ff6b00;
                        }
                        .otp-code {
                            font-size: 52px;
                            font-weight: bold;
                            letter-spacing: 12px;
                            color: #ff6b00;
                            margin: 0;
                            font-family: 'Courier New', Courier, monospace;
                            text-shadow: 0 0 10px #ff6b00;
                        }
                        .footer {
                            background-color: #f4f4f4;
                            padding: 25px;
                            text-align: center;
                            font-size: 12px;
                            color: #777;
                            border-top: 2px dashed #ff6b00;
                        }
                        .court-line {
                            height: 4px;
                            background: #1a1a1a;
                            width: 50%;
                            margin: 0 auto;
                            border-radius: 10px;
                        }
                        .button {
                            display: inline-block;
                            padding: 15px 35px;
                            background-color: #1a1a1a;
                            color: #ff6b00;
                            text-decoration: none;
                            border-radius: 50px;
                            font-weight: bold;
                            text-transform: uppercase;
                            border: 2px solid #ff6b00;
                            transition: 0.3s;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🏀 HoopConnect</h1>
                        </div>
                        <div class="content">
                            <div class="greeting">Мяч в игре, {{USERNAME}}!</div>
                            <div class="message">
                                Твой пропуск на площадку почти готов. Введи этот проверочный код, чтобы подтвердить вход в систему.
                            </div>

                            <div class="otp-box">
                                <p class="otp-code">{{OTP_CODE}}</p>
                            </div>

                            <div class="court-line"></div>

                            <div class="message" style="margin-top: 25px; font-size: 14px; font-style: italic;">
                                Тайм-аут: код истечет через 10 минут. Если это не твой маневр, просто проигнорируй это сообщение.
                            </div>
                        </div>
                        <div class="footer">
                            <p>&copy; 2026 HoopConnect Team. Все права защищены. 🏀</p>
                            <p>Это автоматическое письмо из тренировочного лагеря, отвечать на него не нужно.</p>
                        </div>
                    </div>
                </body>
                </html>
                """;

        return template
                .replace("{{USERNAME}}", username)
                .replace("{{OTP_CODE}}", otpCode);
    }
}
