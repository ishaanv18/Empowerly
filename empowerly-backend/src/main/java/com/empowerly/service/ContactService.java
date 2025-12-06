package com.empowerly.service;

import com.empowerly.model.ContactMessage;
import com.empowerly.repository.ContactMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactService {

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    @Autowired
    private EmailService emailService;

    @Value("${contact.admin.email:ishaan.verma36@gmail.com}")
    private String adminEmail;

    public ContactMessage submitContactForm(ContactMessage contactMessage) {
        // Save the contact message to database
        ContactMessage savedMessage = contactMessageRepository.save(contactMessage);

        // Send email to admin
        try {
            String emailSubject = "New Contact Form Submission: " + contactMessage.getSubject();
            String emailBody = buildEmailBody(contactMessage);

            emailService.sendEmail(adminEmail, emailSubject, emailBody);

            // Mark email as sent
            savedMessage.setEmailSent(true);
            contactMessageRepository.save(savedMessage);
        } catch (Exception e) {
            // Log error but don't fail the submission
            System.err.println("Failed to send contact form email: " + e.getMessage());
        }

        return savedMessage;
    }

    private String buildEmailBody(ContactMessage message) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f5f7fa;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 650px;
                            margin: 40px auto;
                            background-color: #ffffff;
                            border-radius: 16px;
                            overflow: hidden;
                            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 40px 30px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 32px;
                            font-weight: 700;
                            letter-spacing: -0.5px;
                        }
                        .header p {
                            margin: 10px 0 0 0;
                            font-size: 16px;
                            opacity: 0.95;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .info-section {
                            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                            border-radius: 12px;
                            padding: 25px;
                            margin-bottom: 25px;
                            border-left: 4px solid #667eea;
                        }
                        .info-row {
                            display: flex;
                            margin-bottom: 15px;
                            align-items: flex-start;
                        }
                        .info-row:last-child {
                            margin-bottom: 0;
                        }
                        .info-label {
                            font-weight: 700;
                            color: #334155;
                            min-width: 120px;
                            font-size: 14px;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        .info-value {
                            color: #475569;
                            font-size: 14px;
                            flex: 1;
                            word-break: break-word;
                        }
                        .info-value a {
                            color: #667eea;
                            text-decoration: none;
                            font-weight: 600;
                        }
                        .message-box {
                            background: #ffffff;
                            border: 2px solid #e2e8f0;
                            border-radius: 12px;
                            padding: 20px;
                            margin-top: 20px;
                        }
                        .message-label {
                            font-weight: 700;
                            color: #334155;
                            font-size: 14px;
                            margin-bottom: 12px;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        .message-content {
                            color: #475569;
                            line-height: 1.6;
                            font-size: 15px;
                            white-space: pre-wrap;
                            word-wrap: break-word;
                        }
                        .timestamp {
                            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                            border-radius: 8px;
                            padding: 12px 16px;
                            margin-top: 20px;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            font-size: 13px;
                            color: #92400e;
                        }
                        .reply-section {
                            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                            border-radius: 12px;
                            padding: 20px;
                            margin-top: 25px;
                            text-align: center;
                        }
                        .reply-section p {
                            margin: 0 0 15px 0;
                            color: #1e40af;
                            font-size: 14px;
                            font-weight: 600;
                        }
                        .reply-button {
                            display: inline-block;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 12px 30px;
                            border-radius: 8px;
                            text-decoration: none;
                            font-weight: 600;
                            font-size: 14px;
                            transition: transform 0.2s;
                        }
                        .footer {
                            background-color: #f8fafc;
                            padding: 25px 30px;
                            text-align: center;
                            border-top: 1px solid #e2e8f0;
                        }
                        .footer p {
                            margin: 5px 0;
                            color: #64748b;
                            font-size: 13px;
                        }
                        .footer .brand {
                            font-weight: 700;
                            color: #667eea;
                            font-size: 14px;
                        }
                        .icon {
                            font-size: 16px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚀 Empowerly</h1>
                            <p>New Contact Form Submission</p>
                        </div>

                        <div class="content">
                            <div class="info-section">
                                <div class="info-row">
                                    <div class="info-label"><span class="icon">👤</span> Name:</div>
                                    <div class="info-value">""" + message.getName() + """
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label"><span class="icon">📧</span> Email:</div>
                    <div class="info-value">
                        <a href="mailto:""" + message.getEmail() + """
                ">""" + message.getEmail() + """
                        </a>
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label"><span class="icon">📋</span> Subject:</div>
                    <div class="info-value">""" + message.getSubject() + """
                        </div>
                    </div>
                </div>

                <div class="message-box">
                    <div class="message-label">
                        <span class="icon">💬</span> Message:
                    </div>
                    <div class="message-content">""" + message.getMessage() + """
                    </div>
                </div>

                <div class="timestamp">
                    <span class="icon">⏰</span>
                    <strong>Submitted:</strong> """ + message.getSubmittedAt().toString() + """
                </div>

                <div class="reply-section">
                    <p>💡 Ready to respond?</p>
                    <a href="mailto:""" + message.getEmail() + """
                ?subject=Re: """ + message.getSubject() + """
                " class="reply-button">
                    Reply to """ + message.getName() + """
                                </a>
                            </div>
                        </div>

                        <div class="footer">
                            <p class="brand">© 2025 Empowerly. All rights reserved.</p>
                            <p>This is an automated notification from the Empowerly Contact Form.</p>
                            <p style="margin-top: 10px; font-size: 12px;">
                                📍 Empowerly HR Management System | 🌐 empowerly.com
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """;
    }

    public List<ContactMessage> getAllMessages() {
        return contactMessageRepository.findAllByOrderBySubmittedAtDesc();
    }

    public List<ContactMessage> getUnsentMessages() {
        return contactMessageRepository.findByEmailSentFalse();
    }

    public void deleteMessage(String id) {
        contactMessageRepository.deleteById(id);
    }
}
