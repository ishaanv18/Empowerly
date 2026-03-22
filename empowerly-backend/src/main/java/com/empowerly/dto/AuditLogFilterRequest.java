package com.empowerly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogFilterRequest {
    private String userId;
    private String action;
    private String entityType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private String searchTerm;
}
