package com.empowerly.service;

import com.empowerly.model.LoginAttempt;
import com.empowerly.model.SecurityAlert;
import com.empowerly.model.SessionRecord;
import com.empowerly.model.User;
import com.empowerly.repository.LoginAttemptRepository;
import com.empowerly.repository.SecurityAlertRepository;
import com.empowerly.repository.SessionRecordRepository;
import com.empowerly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SecurityMonitoringService {

    private final SessionRecordRepository sessionRecordRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final SecurityAlertRepository securityAlertRepository;
    private final UserRepository userRepository;

    // ==================== SESSION RECORDING ====================

    public SessionRecord recordSession(String userId, String action, String actionType,
            String ipAddress, String userAgent, Map<String, Object> metadata) {
        User user = userRepository.findById(userId).orElse(null);

        SessionRecord record = new SessionRecord();
        record.setUserId(userId);
        record.setUserName(user != null ? user.getName() : "Unknown");
        record.setUserRole(user != null && user.getRole() != null ? user.getRole().toString() : "EMPLOYEE");
        record.setAction(action);
        record.setActionType(actionType);
        record.setIpAddress(ipAddress);
        record.setUserAgent(userAgent);
        record.setTimestamp(LocalDateTime.now());
        record.setMetadata(metadata);

        return sessionRecordRepository.save(record);
    }

    public List<SessionRecord> getSessionHistory(String userId, LocalDateTime start, LocalDateTime end) {
        if (start != null && end != null) {
            return sessionRecordRepository.findByUserIdAndTimestampBetweenOrderByTimestampDesc(userId, start, end);
        }
        return sessionRecordRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public List<SessionRecord> getAllSessions(LocalDateTime start, LocalDateTime end) {
        if (start != null && end != null) {
            return sessionRecordRepository.findByTimestampBetweenOrderByTimestampDesc(start, end);
        }
        return sessionRecordRepository.findAll();
    }

    // ==================== LOGIN PATTERN ANALYSIS ====================

    public LoginAttempt recordLoginAttempt(String email, String userId, boolean success,
            String failureReason, String ipAddress, String userAgent) {
        LoginAttempt attempt = new LoginAttempt();
        attempt.setEmail(email);
        attempt.setUserId(userId);
        attempt.setSuccess(success);
        attempt.setFailureReason(failureReason);
        attempt.setIpAddress(ipAddress);
        attempt.setUserAgent(userAgent);
        attempt.setLoginTime(LocalDateTime.now());

        // Analyze if this login is unusual
        if (success) {
            analyzeLoginPattern(attempt);
        } else {
            checkMultipleFailedAttempts(email);
        }

        return loginAttemptRepository.save(attempt);
    }

    public void recordLogout(String userId) {
        List<LoginAttempt> recentLogins = loginAttemptRepository.findByUserIdOrderByLoginTimeDesc(userId);
        if (!recentLogins.isEmpty()) {
            LoginAttempt lastLogin = recentLogins.get(0);
            if (lastLogin.getLogoutTime() == null) {
                lastLogin.setLogoutTime(LocalDateTime.now());
                loginAttemptRepository.save(lastLogin);
            }
        }
    }

    private void analyzeLoginPattern(LoginAttempt attempt) {
        // Check for unusual login time (11 PM - 5 AM)
        LocalTime loginTime = attempt.getLoginTime().toLocalTime();
        if (loginTime.isAfter(LocalTime.of(23, 0)) || loginTime.isBefore(LocalTime.of(5, 0))) {
            attempt.setUnusual(true);
            attempt.setUnusualReason("Login during unusual hours (11 PM - 5 AM)");

            // Generate alert
            User user = userRepository.findById(attempt.getUserId()).orElse(null);
            if (user != null) {
                generateAlert(
                        attempt.getUserId(),
                        user.getName(),
                        "UNUSUAL_TIME",
                        "WARNING",
                        String.format("Login detected at unusual time: %s", attempt.getLoginTime()));
            }
        }
    }

    private void checkMultipleFailedAttempts(String email) {
        LocalDateTime tenMinutesAgo = LocalDateTime.now().minusMinutes(10);
        List<LoginAttempt> recentFailures = loginAttemptRepository
                .findByEmailAndSuccessFalseAndLoginTimeAfter(email, tenMinutesAgo);

        if (recentFailures.size() >= 3) {
            // Generate critical alert
            generateAlert(
                    null,
                    email,
                    "MULTIPLE_FAILURES",
                    "CRITICAL",
                    String.format("Multiple failed login attempts detected: %d attempts in 10 minutes",
                            recentFailures.size()));
        }
    }

    public List<LoginAttempt> getLoginHistory(LocalDateTime start, LocalDateTime end) {
        if (start != null && end != null) {
            return loginAttemptRepository.findByLoginTimeBetweenOrderByLoginTimeDesc(start, end);
        }
        return loginAttemptRepository.findAll();
    }

    public List<LoginAttempt> getUnusualLogins() {
        return loginAttemptRepository.findByIsUnusualTrueOrderByLoginTimeDesc();
    }

    // ==================== ALERT MANAGEMENT ====================

    public SecurityAlert generateAlert(String userId, String userName, String alertType,
            String severity, String description) {
        SecurityAlert alert = new SecurityAlert();
        alert.setUserId(userId);
        alert.setUserName(userName);
        alert.setAlertType(alertType);
        alert.setSeverity(severity);
        alert.setDescription(description);
        alert.setDetectedAt(LocalDateTime.now());
        alert.setStatus("NEW");

        return securityAlertRepository.save(alert);
    }

    public List<SecurityAlert> getActiveAlerts() {
        return securityAlertRepository.findByStatusOrderByDetectedAtDesc("NEW");
    }

    public List<SecurityAlert> getAllAlerts() {
        return securityAlertRepository.findAll();
    }

    public List<SecurityAlert> getAlertsBySeverity(String severity) {
        return securityAlertRepository.findBySeverityOrderByDetectedAtDesc(severity);
    }

    public SecurityAlert reviewAlert(String alertId, String adminId) {
        SecurityAlert alert = securityAlertRepository.findById(alertId).orElse(null);
        if (alert != null) {
            alert.setStatus("REVIEWED");
            alert.setReviewedBy(adminId);
            alert.setReviewedAt(LocalDateTime.now());
            return securityAlertRepository.save(alert);
        }
        return null;
    }

    public SecurityAlert resolveAlert(String alertId, String adminId, String resolution) {
        SecurityAlert alert = securityAlertRepository.findById(alertId).orElse(null);
        if (alert != null) {
            alert.setStatus("RESOLVED");
            alert.setReviewedBy(adminId);
            alert.setResolvedAt(LocalDateTime.now());
            alert.setResolution(resolution);
            return securityAlertRepository.save(alert);
        }
        return null;
    }

    // ==================== STATISTICS ====================

    public Map<String, Object> getSecurityStats() {
        long totalSessions = sessionRecordRepository.count();
        long totalLogins = loginAttemptRepository.count();
        long unusualLogins = loginAttemptRepository.findByIsUnusualTrueOrderByLoginTimeDesc().size();
        long activeAlerts = securityAlertRepository.findByStatusOrderByDetectedAtDesc("NEW").size();
        long criticalAlerts = securityAlertRepository.findByStatusAndSeverityOrderByDetectedAtDesc("NEW", "CRITICAL")
                .size();

        return Map.of(
                "totalSessions", totalSessions,
                "totalLogins", totalLogins,
                "unusualLogins", unusualLogins,
                "activeAlerts", activeAlerts,
                "criticalAlerts", criticalAlerts);
    }
}
