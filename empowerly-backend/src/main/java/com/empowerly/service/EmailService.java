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
                "sender",      Map.of("email", fromEmail, "name", fromName),
                "to",          List.of(Map.of("email", toEmail)),
                "subject",     subject,
                "htmlContent", htmlContent
            );

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

    /**
     * Renders individual OTP digit boxes server-side.
     * Email clients block JavaScript, so we can't use a <script> to build them.
     */
    private String buildOtpDigitBoxes(String otpCode) {
        StringBuilder sb = new StringBuilder();
        for (char digit : otpCode.toCharArray()) {
            sb.append("<div class='otp-digit'>").append(digit).append("</div>");
        }
        return sb.toString();
    }

    private String buildOTPEmailTemplate(String userName, String otpCode) {
        String otpDigitBoxes = buildOtpDigitBoxes(otpCode);

        return String.format(
            "<!DOCTYPE html>" +
            "<html lang='en'><head><meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width,initial-scale=1.0'>" +
            "<title>Empowerly - Verify Your Identity</title>" +
            "<link href='https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500&display=swap' rel='stylesheet'>" +
            "<style>" +
            "*{margin:0;padding:0;box-sizing:border-box;}" +
            "body{background-color:#0b0f1a;font-family:'DM Sans',sans-serif;color:#e2e8f0;-webkit-font-smoothing:antialiased;}" +
            ".shell{max-width:560px;margin:40px auto;padding:0 16px;}" +
            ".accent-bar{height:4px;background:linear-gradient(90deg,#00d2ff 0%%,#7b2ff7 50%%,#ff6b6b 100%%);border-radius:4px 4px 0 0;}" +
            ".card{background:#111827;border:1px solid rgba(255,255,255,0.06);border-top:none;border-radius:0 0 20px 20px;overflow:hidden;}" +
            ".hero{padding:48px 40px 36px;position:relative;overflow:hidden;}" +
            ".hero::before{content:'';position:absolute;top:-60px;right:-60px;width:220px;height:220px;" +
            "background:radial-gradient(circle,rgba(123,47,247,0.18) 0%%,transparent 70%%);border-radius:50%%;pointer-events:none;}" +
            ".hero::after{content:'';position:absolute;bottom:-40px;left:-40px;width:180px;height:180px;" +
            "background:radial-gradient(circle,rgba(0,210,255,0.12) 0%%,transparent 70%%);border-radius:50%%;pointer-events:none;}" +
            ".logomark{display:flex;align-items:center;gap:10px;margin-bottom:36px;}" +
            ".logomark-icon{width:36px;height:36px;background:linear-gradient(135deg,#00d2ff,#7b2ff7);border-radius:10px;" +
            "display:flex;align-items:center;justify-content:center;font-size:18px;}" +
            ".logomark-name{font-family:'Playfair Display',serif;font-size:20px;color:#f1f5f9;letter-spacing:0.3px;}" +
            ".greeting{font-size:13px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:#7b2ff7;margin-bottom:12px;}" +
            ".headline{font-family:'Playfair Display',serif;font-size:30px;line-height:1.25;color:#f8fafc;margin-bottom:16px;}" +
            ".subtext{font-size:15px;font-weight:300;color:#94a3b8;line-height:1.7;max-width:380px;}" +
            ".divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent);margin:32px 0;}" +
            ".otp-section{padding:0 40px 40px;}" +
            ".otp-label{font-size:11px;font-weight:500;letter-spacing:2.5px;text-transform:uppercase;color:#475569;margin-bottom:16px;}" +
            ".otp-digits{display:flex;gap:8px;}" +
            ".otp-digit{width:48px;height:60px;background:#1e293b;border:1px solid rgba(123,47,247,0.35);border-radius:10px;" +
            "display:flex;align-items:center;justify-content:center;" +
            "font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#e2e8f0;}" +
            ".timer-pill{display:inline-flex;align-items:center;gap:6px;background:rgba(0,210,255,0.08);" +
            "border:1px solid rgba(0,210,255,0.2);border-radius:20px;padding:6px 14px;" +
            "font-size:12px;font-weight:500;color:#00d2ff;margin-top:16px;}" +
            ".timer-dot{width:6px;height:6px;background:#00d2ff;border-radius:50%%;}" +
            ".security-note{margin-top:28px;background:rgba(255,107,107,0.06);border:1px solid rgba(255,107,107,0.15);" +
            "border-radius:10px;padding:14px 18px;display:flex;align-items:flex-start;gap:12px;}" +
            ".security-icon{font-size:16px;flex-shrink:0;margin-top:1px;}" +
            ".security-text{font-size:13px;color:#94a3b8;line-height:1.6;}" +
            ".security-text strong{color:#cbd5e1;font-weight:500;}" +
            ".footer{padding:24px 40px;border-top:1px solid rgba(255,255,255,0.05);" +
            "display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;}" +
            ".footer-left{font-size:12px;color:#334155;}" +
            ".footer-right{font-size:12px;color:#334155;}" +
            "</style></head><body>" +
            "<div class='shell'>" +
            "<div class='accent-bar'></div>" +
            "<div class='card'>" +
            "<div class='hero'>" +
            "<div class='logomark'>" +
            "<div class='logomark-icon'>&#x26A1;</div>" +
            "<span class='logomark-name'>Empowerly</span>" +
            "</div>" +
            "<p class='greeting'>Identity Verification</p>" +
            "<h1 class='headline'>Welcome aboard,<br>%s.</h1>" +
            "<p class='subtext'>You're one step away from accessing your account. Use the code below to confirm your identity.</p>" +
            "</div>" +
            "<div class='divider' style='margin:0 40px;'></div>" +
            "<div class='otp-section'>" +
            "<p class='otp-label'>Your one-time passcode</p>" +
            "<div class='otp-digits'>%s</div>" +
            "<div class='timer-pill'>" +
            "<span class='timer-dot'></span>" +
            "Expires in 5 minutes" +
            "</div>" +
            "<div class='security-note'>" +
            "<span class='security-icon'>&#x1F512;</span>" +
            "<p class='security-text'><strong>Never share this code.</strong> Empowerly will never ask for your OTP via phone, chat, or email. If you didn't request this, you can safely ignore it.</p>" +
            "</div>" +
            "</div>" +
            "<div class='footer'>" +
            "<span class='footer-left'>&copy; 2026 Empowerly Inc. All rights reserved.</span>" +
            "<span class='footer-right'>Automated message &mdash; do not reply</span>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</body></html>",
            userName, otpDigitBoxes
        );
    }
}
