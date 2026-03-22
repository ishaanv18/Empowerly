package com.empowerly.controller;

import com.empowerly.model.LoginAttempt;
import com.empowerly.model.SecurityAlert;
import com.empowerly.model.SessionRecord;
import com.empowerly.service.SecurityMonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SecurityController {

    private final SecurityMonitoringService securityMonitoringService;

    // ==================== SESSION RECORDING ====================

    @PostMapping("/session")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SessionRecord> recordSession(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        String userId = authentication.getName();
        String action = (String) request.get("action");
        String actionType = (String) request.get("actionType");
        String ipAddress = (String) request.get("ipAddress");
        String userAgent = (String) request.get("userAgent");
        @SuppressWarnings("unchecked")
        Map<String, Object> metadata = (Map<String, Object>) request.getOrDefault("metadata", Map.of());

        SessionRecord record = securityMonitoringService.recordSession(
                userId, action, actionType, ipAddress, userAgent, metadata);
        return ResponseEntity.ok(record);
    }

    @GetMapping("/sessions")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<SessionRecord>> getAllSessions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<SessionRecord> sessions = securityMonitoringService.getAllSessions(start, end);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/sessions/user/{userId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<SessionRecord>> getUserSessions(
            @PathVariable String userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<SessionRecord> sessions = securityMonitoringService.getSessionHistory(userId, start, end);
        return ResponseEntity.ok(sessions);
    }

    // ==================== LOGIN ATTEMPTS ====================

    @GetMapping("/login-attempts")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<LoginAttempt>> getLoginAttempts(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<LoginAttempt> attempts = securityMonitoringService.getLoginHistory(start, end);
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/login-attempts/unusual")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<LoginAttempt>> getUnusualLogins() {
        List<LoginAttempt> unusual = securityMonitoringService.getUnusualLogins();
        return ResponseEntity.ok(unusual);
    }

    // ==================== SECURITY ALERTS ====================

    @GetMapping("/alerts")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<SecurityAlert>> getAllAlerts() {
        List<SecurityAlert> alerts = securityMonitoringService.getAllAlerts();
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/alerts/active")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<SecurityAlert>> getActiveAlerts() {
        List<SecurityAlert> alerts = securityMonitoringService.getActiveAlerts();
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/alerts/severity/{severity}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<SecurityAlert>> getAlertsBySeverity(@PathVariable String severity) {
        List<SecurityAlert> alerts = securityMonitoringService.getAlertsBySeverity(severity);
        return ResponseEntity.ok(alerts);
    }

    @PutMapping("/alerts/{id}/review")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<SecurityAlert> reviewAlert(
            @PathVariable String id,
            Authentication authentication) {
        String adminId = authentication.getName();
        SecurityAlert alert = securityMonitoringService.reviewAlert(id, adminId);
        return ResponseEntity.ok(alert);
    }

    @PutMapping("/alerts/{id}/resolve")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<SecurityAlert> resolveAlert(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String adminId = authentication.getName();
        String resolution = request.get("resolution");
        SecurityAlert alert = securityMonitoringService.resolveAlert(id, adminId, resolution);
        return ResponseEntity.ok(alert);
    }

    // ==================== STATISTICS ====================

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getSecurityStats() {
        Map<String, Object> stats = securityMonitoringService.getSecurityStats();
        return ResponseEntity.ok(stats);
    }
}
