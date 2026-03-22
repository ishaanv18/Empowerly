package com.empowerly.repository;

import com.empowerly.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {

    // Find all logs for a specific user
    List<AuditLog> findByUserIdOrderByTimestampDesc(String userId);

    // Find logs for a specific user with pagination
    Page<AuditLog> findByUserIdOrderByTimestampDesc(String userId, Pageable pageable);

    // Find logs for a specific entity
    List<AuditLog> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, String entityId);

    // Find logs by action type
    Page<AuditLog> findByActionOrderByTimestampDesc(String action, Pageable pageable);

    // Find logs within a time range
    Page<AuditLog> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end,
            Pageable pageable);

    // Find logs for a user within a time range
    List<AuditLog> findByUserIdAndTimestampBetweenOrderByTimestampDesc(String userId, LocalDateTime start,
            LocalDateTime end);

    // Find logs for an entity type within a time range
    Page<AuditLog> findByEntityTypeAndTimestampBetweenOrderByTimestampDesc(String entityType, LocalDateTime start,
            LocalDateTime end, Pageable pageable);

    // Find logs by status
    Page<AuditLog> findByStatusOrderByTimestampDesc(String status, Pageable pageable);

    // Find all logs with pagination
    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);

    // Search logs by description (case-insensitive)
    @Query("{ 'description': { $regex: ?0, $options: 'i' } }")
    Page<AuditLog> searchByDescription(String searchTerm, Pageable pageable);

    // Count logs by action
    long countByAction(String action);

    // Count logs by user
    long countByUserId(String userId);

    // Count logs by entity type
    long countByEntityType(String entityType);

    // Find recent logs (last N hours)
    List<AuditLog> findByTimestampAfterOrderByTimestampDesc(LocalDateTime since);
}
