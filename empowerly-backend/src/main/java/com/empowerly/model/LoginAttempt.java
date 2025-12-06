package com.empowerly.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "login_attempts")
public class LoginAttempt {
    @Id
    private String id;
    private String userId;
    private String email;
    private boolean success;
    private String failureReason;
    private String ipAddress;
    private String userAgent;
    private String location;
    private LocalDateTime loginTime;
    private LocalDateTime logoutTime;
    private boolean isUnusual; // Flagged by pattern analysis
    private String unusualReason; // Why it was flagged
}
