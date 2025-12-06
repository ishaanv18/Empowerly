package com.empowerly.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "security_alerts")
public class SecurityAlert {
    @Id
    private String id;
    private String userId;
    private String userName;
    private String alertType; // UNUSUAL_LOGIN, MULTIPLE_FAILURES, UNUSUAL_TIME, RAPID_ACTIONS, ADMIN_ACTION
    private String severity; // CRITICAL, WARNING, INFO
    private String description;
    private LocalDateTime detectedAt;
    private String status = "NEW"; // NEW, REVIEWED, RESOLVED
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime resolvedAt;
    private String resolution;
}
