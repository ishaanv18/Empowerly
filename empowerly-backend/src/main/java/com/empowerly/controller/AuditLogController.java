package com.empowerly.controller;

import com.empowerly.dto.AuditLogDTO;
import com.empowerly.model.AuditLog;
import com.empowerly.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuditLogController {

    private final AuditLogService auditLogService;

    // ==================== GET ALL AUDIT LOGS ====================

    @GetMapping
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Page<AuditLogDTO>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        Pageable pageable = PageRequest.of(page, size);

        Page<AuditLog> logs = auditLogService.getFilteredLogs(
                userId, action, entityType, startDate, endDate, status, search, pageable);

        Page<AuditLogDTO> dtoPage = logs.map(this::convertToDTO);

        return ResponseEntity.ok(dtoPage);
    }

    // ==================== GET USER ACTIVITY LOGS ====================

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<AuditLogDTO>> getUserActivityLogs(
            @PathVariable String userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<AuditLog> logs = auditLogService.getUserActivityLogs(userId, startDate, endDate);
        List<AuditLogDTO> dtos = logs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // ==================== GET ENTITY AUDIT TRAIL ====================

    @GetMapping("/entity/{entityType}/{entityId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<AuditLogDTO>> getEntityAuditTrail(
            @PathVariable String entityType,
            @PathVariable String entityId) {

        List<AuditLog> logs = auditLogService.getEntityAuditTrail(entityType, entityId);
        List<AuditLogDTO> dtos = logs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // ==================== SEARCH AUDIT LOGS ====================

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Page<AuditLogDTO>> searchAuditLogs(
            @RequestParam String query,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> logs = auditLogService.searchLogs(query, startDate, endDate, pageable);
        Page<AuditLogDTO> dtoPage = logs.map(this::convertToDTO);

        return ResponseEntity.ok(dtoPage);
    }

    // ==================== GET AUDIT STATISTICS ====================

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getAuditStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        Map<String, Object> stats = auditLogService.getAuditStatistics(startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    // ==================== HELPER METHODS ====================

    private AuditLogDTO convertToDTO(AuditLog log) {
        return new AuditLogDTO(
                log.getId(),
                log.getUserId(),
                log.getUserName(),
                log.getUserRole(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getDescription(),
                log.getDetails(),
                log.getIpAddress(),
                log.getUserAgent(),
                log.getTimestamp(),
                log.getStatus(),
                log.getErrorMessage());
    }
}
