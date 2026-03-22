package com.empowerly.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.from.email}")
    private String fromEmail;

    @Value("${brevo.from.name}")
    private String fromName;

    public boolean sendOTPEmail(String toEmail, String otpCode, String userName) {
        String subject = "Empowerly - Verify Your Account";
        String htmlContent = buildOTPEmailTemplate(userName, otpCode);
        return sendEmail(toEmail, subject, htmlContent);
    }

    public boolean sendEmail(String toEmail, String subject, String htmlContent) {
        try {
            Map<String, Object> body = Map.of(
                    "sender", Map.of("email", fromEmail, "name", fromName),
                    "to", List.of(Map.of("email", toEmail)),
                    "subject", subject,
                    "htmlContent", htmlContent);

            WebClient.create()
                    .post()
                    .uri(BREVO_API_URL)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("api-key", brevoApiKey)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            logger.info("Email sent successfully to: {}", toEmail);
            return true;

        } catch (WebClientResponseException ex) {
            logger.error("Failed to send email to: {}. Status: {}, Body: {}",
                    toEmail, ex.getStatusCode(), ex.getResponseBodyAsString());
            return false;
        } catch (Exception ex) {
            logger.error("Error sending email to: {}", toEmail, ex);
            return false;
        }
    }

    private String buildOTPEmailTemplate(String userName, String otpCode) {
        return String.format(
                "<!DOCTYPE html>" +
                        "<html><head><style>" +
                        "body{font-family:Arial,sans-serif;background-color:#f4f4f4;margin:0;padding:0;}" +
                        ".container{max-width:600px;margin:50px auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);}"
                        +
                        ".header{background:linear-gradient(135deg,#6366f1 0%%,#8b5cf6 100%%);color:white;padding:30px;text-align:center;}"
                        +
                        ".header h1{margin:0;font-size:28px;}" +
                        ".content{padding:40px 30px;text-align:center;}" +
                        ".otp-box{background:#f8fafc;border:2px dashed #6366f1;border-radius:8px;padding:20px;margin:30px 0;}"
                        +
                        ".otp-code{font-size:36px;font-weight:bold;color:#6366f1;letter-spacing:8px;margin:10px 0;}" +
                        ".footer{background:#f8fafc;padding:20px;text-align:center;color:#64748b;font-size:14px;}" +
                        "</style></head><body>" +
                        "<div class=\"container\">" +
                        "<div class=\"header\"><h1>\uD83D\uDE80 Empowerly</h1></div>" +
                        "<div class=\"content\">" +
                        "<h2>Welcome, %s!</h2>" +
                        "<p>Thank you for signing up with Empowerly. To complete your registration, please use the following OTP:</p>"
                        +
                        "<div class=\"otp-box\">" +
                        "<p style=\"margin:0;color:#64748b;\">Your verification code</p>" +
                        "<div class=\"otp-code\">%s</div>" +
                        "<p style=\"margin:0;color:#64748b;font-size:12px;\">This code will expire in 5 minutes</p>" +
                        "</div>" +
                        "<p>If you didn't request this code, please ignore this email.</p>" +
                        "</div>" +
                        "<div class=\"footer\">" +
                        "<p>&copy; 2026 Empowerly. All rights reserved.</p>" +
                        "<p>This is an automated email, please do not reply.</p>" +
                        "</div>" +
                        "</div></body></html>",
                userName, otpCode);
    }
}
