package com.empowerly.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    @Value("${sendgrid.from.email}")
    private String fromEmail;

    @Value("${sendgrid.from.name}")
    private String fromName;

    public boolean sendOTPEmail(String toEmail, String otpCode, String userName) {
        Email from = new Email(fromEmail, fromName);
        Email to = new Email(toEmail);
        String subject = "Empowerly - Verify Your Account";

        String htmlContent = buildOTPEmailTemplate(userName, otpCode);
        Content content = new Content("text/html", htmlContent);

        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                logger.info("OTP email sent successfully to: {}", toEmail);
                return true;
            } else {
                logger.error("Failed to send OTP email. Status: {}, Body: {}",
                        response.getStatusCode(), response.getBody());
                return false;
            }
        } catch (IOException ex) {
            logger.error("Error sending OTP email to: {}", toEmail, ex);
            return false;
        }
    }

    private String buildOTPEmailTemplate(String userName, String otpCode) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 50px auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                        }
                        .content {
                            padding: 40px 30px;
                            text-align: center;
                        }
                        .otp-box {
                            background-color: #f8fafc;
                            border: 2px dashed #6366f1;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 30px 0;
                        }
                        .otp-code {
                            font-size: 36px;
                            font-weight: bold;
                            color: #6366f1;
                            letter-spacing: 8px;
                            margin: 10px 0;
                        }
                        .footer {
                            background-color: #f8fafc;
                            padding: 20px;
                            text-align: center;
                            color: #64748b;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚀 Empowerly</h1>
                        </div>
                        <div class="content">
                            <h2>Welcome, """ + userName
                + """
                        !</h2>
                                                <p>Thank you for signing up with Empowerly. To complete your registration, please use the following OTP:</p>
                                                <div class="otp-box">
                                                    <p style="margin: 0; color: #64748b;">Your verification code</p>
                                                    <div class="otp-code">"""
                + otpCode
                + """
                        </div>
                                                    <p style="margin: 0; color: #64748b; font-size: 12px;">This code will expire in 5 minutes</p>
                                                </div>
                                                <p>If you didn't request this code, please ignore this email.</p>
                                            </div>
                                            <div class="footer">
                                                <p>© 2025 Empowerly. All rights reserved.</p>
                                                <p>This is an automated email, please do not reply.</p>
                                            </div>
                                        </div>
                                    </body>
                                    </html>
                                    """;
    }

    public boolean sendEmail(String toEmail, String subject, String htmlContent) {
        Email from = new Email(fromEmail, fromName);
        Email to = new Email(toEmail);
        Content content = new Content("text/html", htmlContent);

        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);

            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                logger.info("Email sent successfully to: {}", toEmail);
                return true;
            } else {
                logger.error("Failed to send email. Status: {}, Body: {}",
                        response.getStatusCode(), response.getBody());
                return false;
            }
        } catch (IOException ex) {
            logger.error("Error sending email to: {}", toEmail, ex);
            return false;
        }
    }
}
