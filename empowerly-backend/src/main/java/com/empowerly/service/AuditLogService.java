package com.empowerly.service;

import com.empowerly.model.AuditLog;
import com.empowerly.model.User;
import com.empowerly.repository.AuditLogRepository;
import com.empowerly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    // Sensitive fields that should be masked
    private static final List<String> SENSITIVE_FIELDS = List.of(
            "salary", "baseSalary", "basicSalary", "netSalary", "grossSalary",
            "password", "oldPassword", "newPassword", "otp", "token",
            "accountNumber", "bankAccount", "ssn", "taxId");

    /**
     * Log an action asynchronously to avoid blocking main operations
     */
    @Async
    public void logAction(String userId, String action, String entityType, String entityId,
            String description, Map<String, Object> details, String ipAddress,
            String userAgent, String status, String errorMessage) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            String userName = user != null ? user.getName() : "Unknown";
            String userRole = user != null && user.getRole() != null ? user.getRole().toString() : "EMPLOYEE";

            // Sanitize details to mask sensitive data
            Map<String, Object> sanitizedDetails = sanitizeDetails(details);

            AuditLog auditLog = new AuditLog(
                    userId, userName, userRole, action, entityType, entityId,
                    description, sanitizedDetails, ipAddress, userAgent, status, errorMessage);

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // Log error but don't fail the main operation
            System.err.println("Failed to create audit log: " + e.getMessage());
        }
    }

    /**
     * Overloaded method for successful actions (no error message)
     */
    @Async
    public void logAction(String userId, String action, String entityType, String entityId,
            String description, Map<String, Object> details, String ipAddress,
            String userAgent) {
        logAction(userId, action, entityType, entityId, description, details, ipAddress, userAgent, "SUCCESS", null);
    }

    /**
     * Get all audit logs with pagination
     */
    public Page<AuditLog> getAllLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }

    /**
     * Get filtered audit logs with dynamic criteria
     */
    public Page<AuditLog> getFilteredLogs(String userId, String action, String entityType,
            LocalDateTime startDate, LocalDateTime endDate,
            String status, String searchTerm, Pageable pageable) {

        Query query = new Query();
        Criteria criteria = new Criteria();
        boolean criteriaAdded = false;

        // 1. Search (Description)
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            criteria.and("description").regex(searchTerm, "i");
            criteriaAdded = true;
        }

        // 2. User ID
        if (userId != null && !userId.trim().isEmpty()) {
            // Apply strict equality for userId
            // Note: If criteria was already started (e.g. by search), we chain .and()
            // But since 'criteria' is a single object, we can just keep adding to it if we
            // use new Criteria() logic properly
            // However, Spring Data Criteria 'and' chaining is a bit implicit.
            // Better approach: build a list of criteria and use .andOperator()

            // Correction: The safest way with simple AND logic is chaining on the query or
            // using strict definition
            // Let's use the standard pattern for separate fields:
            query.addCriteria(Criteria.where("userId").is(userId));
        }

        // 3. Action
        if (action != null && !action.trim().isEmpty()) {
            query.addCriteria(Criteria.where("action").is(action));
        }

        // 4. Entity Type
        if (entityType != null && !entityType.trim().isEmpty()) {
            query.addCriteria(Criteria.where("entityType").is(entityType));
        }

        // 5. Status
        if (status != null && !status.trim().isEmpty()) {
            query.addCriteria(Criteria.where("status").is(status));
        }

        // 6. Date Range
        if (startDate != null || endDate != null) {
            Criteria dateCriteria = Criteria.where("timestamp");
            if (startDate != null) {
                dateCriteria.gte(startDate);
            }
            if (endDate != null) {
                dateCriteria.lte(endDate);
            }
            query.addCriteria(dateCriteria);
        }

        // 7. Apply Search Term (if any, as regex)
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            query.addCriteria(Criteria.where("description").regex(searchTerm, "i"));
        }

        // Count total matching items for pagination
        long total = mongoTemplate.count(query, AuditLog.class);

        // Apply Pagination and Sort
        query.with(pageable);
        // Ensure default sort if none provided
        if (!pageable.getSort().isSorted()) {
            query.with(Sort.by(Sort.Direction.DESC, "timestamp"));
        }

        List<AuditLog> logs = mongoTemplate.find(query, AuditLog.class);

        return new PageImpl<>(logs, pageable, total);
    }

    /**
     * Get audit logs for a specific user
     */
    public List<AuditLog> getUserActivityLogs(String userId, LocalDateTime start, LocalDateTime end) {
        if (start != null && end != null) {
            return auditLogRepository.findByUserIdAndTimestampBetweenOrderByTimestampDesc(userId, start, end);
        }
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    /**
     * Get audit trail for a specific entity
     */
    public List<AuditLog> getEntityAuditTrail(String entityType, String entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }

    /**
     * Search audit logs by keyword
     */
    public Page<AuditLog> searchLogs(String searchTerm, LocalDateTime start, LocalDateTime end, Pageable pageable) {
        return auditLogRepository.searchByDescription(searchTerm, pageable);
    }

    /**
     * Get audit statistics
     */
    public Map<String, Object> getAuditStatistics(LocalDateTime start, LocalDateTime end) {
        Map<String, Object> stats = new HashMap<>();

        // Total logs
        long totalLogs = auditLogRepository.count();
        stats.put("totalLogs", totalLogs);

        // Recent activity (last 24 hours)
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        List<AuditLog> recentLogs = auditLogRepository.findByTimestampAfterOrderByTimestampDesc(last24Hours);
        stats.put("recentActivity", recentLogs.size());

        // Count by action type
        Map<String, Long> actionCounts = new HashMap<>();
        actionCounts.put("LOGIN", auditLogRepository.countByAction("LOGIN"));
        actionCounts.put("CREATE", auditLogRepository.countByAction("CREATE"));
        actionCounts.put("UPDATE", auditLogRepository.countByAction("UPDATE"));
        actionCounts.put("DELETE", auditLogRepository.countByAction("DELETE"));
        actionCounts.put("APPROVE", auditLogRepository.countByAction("APPROVE"));
        actionCounts.put("REJECT", auditLogRepository.countByAction("REJECT"));
        stats.put("actionCounts", actionCounts);

        // Count by entity type
        Map<String, Long> entityCounts = new HashMap<>();
        entityCounts.put("USER", auditLogRepository.countByEntityType("USER"));
        entityCounts.put("ATTENDANCE", auditLogRepository.countByEntityType("ATTENDANCE"));
        entityCounts.put("LEAVE", auditLogRepository.countByEntityType("LEAVE"));
        entityCounts.put("PAYROLL", auditLogRepository.countByEntityType("PAYROLL"));
        entityCounts.put("REVIEW", auditLogRepository.countByEntityType("REVIEW"));
        stats.put("entityCounts", entityCounts);

        // Failed actions
        Page<AuditLog> failedLogs = auditLogRepository.findByStatusOrderByTimestampDesc("FAILURE", Pageable.ofSize(1));
        stats.put("failedActions", failedLogs.getTotalElements());

        return stats;
    }

    /**
     * Sanitize details to mask sensitive data
     */
    private Map<String, Object> sanitizeDetails(Map<String, Object> details) {
        if (details == null || details.isEmpty()) {
            return details;
        }

        Map<String, Object> sanitized = new HashMap<>(details);

        for (String key : sanitized.keySet()) {
            // Check if key contains any sensitive field name (case-insensitive)
            for (String sensitiveField : SENSITIVE_FIELDS) {
                if (key.toLowerCase().contains(sensitiveField.toLowerCase())) {
                    sanitized.put(key, "***MASKED***");
                    break;
                }
            }

            // Recursively sanitize nested maps
            if (sanitized.get(key) instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> nestedMap = (Map<String, Object>) sanitized.get(key);
                sanitized.put(key, sanitizeDetails(nestedMap));
            }
        }

        return sanitized;
    }

    /**
     * Helper method to convert List to Page
     */
    private Page<AuditLog> convertListToPage(List<AuditLog> list, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());

        if (start > list.size()) {
            return Page.empty(pageable);
        }

        List<AuditLog> subList = list.subList(start, end);
        return new org.springframework.data.domain.PageImpl<>(subList, pageable, list.size());
    }

    /**
     * Build a human-readable description for an action
     */
    public String buildDescription(String action, String entityType, String entityName, Map<String, Object> details) {
        StringBuilder desc = new StringBuilder();

        switch (action) {
            case "CREATE":
                desc.append("Created ").append(entityType.toLowerCase()).append(" '").append(entityName).append("'");
                break;
            case "UPDATE":
                desc.append("Updated ").append(entityType.toLowerCase()).append(" '").append(entityName).append("'");
                break;
            case "DELETE":
                desc.append("Deleted ").append(entityType.toLowerCase()).append(" '").append(entityName).append("'");
                break;
            case "APPROVE":
                desc.append("Approved ").append(entityType.toLowerCase()).append(" '").append(entityName).append("'");
                break;
            case "REJECT":
                desc.append("Rejected ").append(entityType.toLowerCase()).append(" '").append(entityName).append("'");
                break;
            case "LOGIN":
                desc.append("Logged in to the system");
                break;
            case "LOGOUT":
                desc.append("Logged out from the system");
                break;
            default:
                desc.append(action).append(" on ").append(entityType.toLowerCase());
        }

        return desc.toString();
    }
}
