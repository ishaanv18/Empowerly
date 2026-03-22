package com.empowerly.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@Document(collection = "session_records")
public class SessionRecord {
    @Id
    private String id;
    private String userId;
    private String userName;
    private String userRole;
    private String sessionId;
    private String action; // LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, DOWNLOAD, ADMIN_ACTION
    private String actionType; // ATTENDANCE, LEAVE, PAYROLL, DOCUMENT, etc.
    private String ipAddress;
    private String userAgent;
    private String location;
    private LocalDateTime timestamp;
    private Map<String, Object> metadata = new HashMap<>();
}
