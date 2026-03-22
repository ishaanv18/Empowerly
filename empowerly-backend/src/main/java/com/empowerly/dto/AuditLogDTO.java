package com.empowerly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {
    private String id;
    private String userId;
    private String userName;
    private String userRole;
    private String action;
    private String entityType;
    private String entityId;
    private String description;
    private Map<String, Object> details;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime timestamp;
    private String status;
    private String errorMessage;
}
