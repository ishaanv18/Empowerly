package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "audit_logs")
@CompoundIndexes({
        @CompoundIndex(name = "user_timestamp_idx", def = "{'userId': 1, 'timestamp': -1}"),
        @CompoundIndex(name = "entity_idx", def = "{'entityType': 1, 'entityId': 1, 'timestamp': -1}")
})
public class AuditLog {

    @Id
    private String id;

    private String userId;

    private String userName;

    private String userRole; // ADMIN, HR, EMPLOYEE

    private String action; // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, APPROVE, REJECT, etc.

    private String entityType; // USER, ATTENDANCE, LEAVE, PAYROLL, REVIEW, etc.

    private String entityId;

    private String description; // Human-readable description

    private Map<String, Object> details; // Additional metadata (before/after values, etc.)

    private String ipAddress;

    private String userAgent;

    @Indexed(expireAfterSeconds = 1296000) // 15 days in seconds (15 * 24 * 60 * 60)
    private LocalDateTime timestamp;

    private String status; // SUCCESS, FAILURE

    private String errorMessage; // Only populated if status is FAILURE

    public AuditLog(String userId, String userName, String userRole, String action,
            String entityType, String entityId, String description,
            Map<String, Object> details, String ipAddress, String userAgent,
            String status, String errorMessage) {
        this.userId = userId;
        this.userName = userName;
        this.userRole = userRole;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.description = description;
        this.details = details;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.errorMessage = errorMessage;
    }
}
