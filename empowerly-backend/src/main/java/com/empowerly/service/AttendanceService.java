package com.empowerly.service;

import com.empowerly.model.Attendance;
import com.empowerly.model.User;
import com.empowerly.repository.AttendanceRepository;
import com.empowerly.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AttendanceService {

        private static final Logger logger = LoggerFactory.getLogger(AttendanceService.class);

        @Autowired
        private AttendanceRepository attendanceRepository;

        @Autowired
        private UserRepository userRepository;

        @Transactional
        public Attendance checkIn(String userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                LocalDate today = LocalDate.now();

                // Check if already checked in today (by date)
                LocalDateTime startOfDay = LocalDateTime.of(today, LocalTime.MIN);
                LocalDateTime endOfDay = LocalDateTime.of(today, LocalTime.MAX);

                List<Attendance> todayAttendance = attendanceRepository.findByUserAndCheckInTimeBetween(
                                user, startOfDay, endOfDay);

                if (!todayAttendance.isEmpty()) {
                        throw new RuntimeException("Already checked in today. Please check out first.");
                }

                Attendance attendance = new Attendance();
                attendance.setUser(user);
                attendance.setDate(today);
                attendance.setCheckInTime(LocalDateTime.now());
                attendance.setStatus("CHECKED_IN");

                // Check if late
                attendance.checkIfLate();

                // Set initial attendance status
                attendance.setAttendanceStatus("PRESENT");

                Attendance saved = attendanceRepository.save(attendance);
                logger.info("User checked in: {} at {} (Late: {})",
                                user.getEmail(), saved.getCheckInTime(), saved.getIsLate());

                return saved;
        }

        @Transactional
        public Attendance checkOut(String userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Find today's active check-in
                LocalDate today = LocalDate.now();
                LocalDateTime startOfDay = LocalDateTime.of(today, LocalTime.MIN);
                LocalDateTime endOfDay = LocalDateTime.of(today, LocalTime.MAX);

                List<Attendance> todayAttendance = attendanceRepository.findByUserAndCheckInTimeBetween(
                                user, startOfDay, endOfDay);

                if (todayAttendance.isEmpty()) {
                        throw new RuntimeException("No check-in found for today. Please check in first.");
                }

                Attendance attendance = todayAttendance.get(0);

                if (attendance.getCheckOutTime() != null) {
                        throw new RuntimeException("Already checked out for today.");
                }

                attendance.setCheckOutTime(LocalDateTime.now());
                attendance.setStatus("CHECKED_OUT");

                // Calculate duration and work hours
                attendance.calculateDuration();

                // Calculate overtime
                attendance.calculateOvertime();

                // Calculate final attendance status
                attendance.calculateAttendanceStatus();

                Attendance saved = attendanceRepository.save(attendance);
                logger.info("User checked out: {} at {} (Duration: {} hours, Status: {}, Overtime: {})",
                                user.getEmail(), saved.getCheckOutTime(), saved.getTotalWorkHours(),
                                saved.getAttendanceStatus(), saved.getIsOvertime());

                return saved;
        }

        public List<Attendance> getUserAttendanceHistory(String userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return attendanceRepository.findByUserOrderByCheckInTimeDesc(user);
        }

        public List<Attendance> getUserAttendanceForMonth(String userId, int year, int month) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                LocalDateTime startOfMonth = LocalDateTime.of(year, month, 1, 0, 0);
                LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusSeconds(1);

                return attendanceRepository.findByUserAndCheckInTimeBetween(user, startOfMonth, endOfMonth);
        }

        public Optional<Attendance> getTodayAttendance(String userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
                LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

                List<Attendance> todayAttendance = attendanceRepository.findByUserAndCheckInTimeBetween(
                                user, startOfDay, endOfDay);

                return todayAttendance.isEmpty() ? Optional.empty() : Optional.of(todayAttendance.get(0));
        }

        public String getAttendanceStatus(String userId) {
                Optional<Attendance> todayAttendance = getTodayAttendance(userId);

                if (todayAttendance.isPresent()) {
                        return todayAttendance.get().getStatus();
                }

                return "CHECKED_OUT";
        }

        public Map<String, Object> getAttendanceReport(String userId, LocalDate startDate, LocalDate endDate) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                LocalDateTime start = LocalDateTime.of(startDate, LocalTime.MIN);
                LocalDateTime end = LocalDateTime.of(endDate, LocalTime.MAX);

                List<Attendance> attendanceList = attendanceRepository.findByUserAndCheckInTimeBetween(user, start,
                                end);

                Map<String, Object> report = new HashMap<>();
                report.put("attendanceRecords", attendanceList);
                report.put("totalDays", attendanceList.size());

                long presentDays = attendanceList.stream()
                                .filter(a -> "PRESENT".equals(a.getAttendanceStatus()))
                                .count();

                long lateDays = attendanceList.stream()
                                .filter(a -> "LATE".equals(a.getAttendanceStatus()))
                                .count();

                long halfDays = attendanceList.stream()
                                .filter(a -> "HALF_DAY".equals(a.getAttendanceStatus()))
                                .count();

                double totalWorkingHours = attendanceList.stream()
                                .filter(a -> a.getTotalWorkHours() != null)
                                .mapToDouble(Attendance::getTotalWorkHours)
                                .sum();

                long totalOvertimeMinutes = attendanceList.stream()
                                .filter(a -> a.getOvertimeMinutes() != null)
                                .mapToLong(Attendance::getOvertimeMinutes)
                                .sum();

                report.put("totalPresentDays", presentDays);
                report.put("totalLateDays", lateDays);
                report.put("totalHalfDays", halfDays);
                report.put("totalWorkingHours", totalWorkingHours);
                report.put("totalOvertimeHours", totalOvertimeMinutes / 60.0);

                return report;
        }

        public Map<String, Object> getMonthlyStats(String userId, int year, int month) {
                LocalDate startDate = LocalDate.of(year, month, 1);
                LocalDate endDate = startDate.plusMonths(1).minusDays(1);

                return getAttendanceReport(userId, startDate, endDate);
        }

        public List<Map<String, Object>> getAllAttendanceWithUserDetails() {
                List<Attendance> allAttendance = attendanceRepository.findAll();

                return allAttendance.stream().map(attendance -> {
                        Map<String, Object> attendanceMap = new HashMap<>();
                        User user = attendance.getUser();

                        attendanceMap.put("id", attendance.getId());
                        attendanceMap.put("date", attendance.getDate());
                        attendanceMap.put("checkInTime", attendance.getCheckInTime());
                        attendanceMap.put("checkOutTime", attendance.getCheckOutTime());
                        attendanceMap.put("status", attendance.getStatus());
                        attendanceMap.put("attendanceStatus", attendance.getAttendanceStatus());
                        attendanceMap.put("totalWorkHours", attendance.getTotalWorkHours());
                        attendanceMap.put("isLate", attendance.getIsLate());
                        attendanceMap.put("isOvertime", attendance.getIsOvertime());

                        // Add user details
                        if (user != null) {
                                attendanceMap.put("userName", user.getName());
                                attendanceMap.put("userEmail", user.getEmail());
                                attendanceMap.put("department",
                                                user.getDepartment() != null ? user.getDepartment().toString() : "N/A");
                        } else {
                                attendanceMap.put("userName", "N/A");
                                attendanceMap.put("userEmail", "N/A");
                                attendanceMap.put("department", "N/A");
                        }

                        return attendanceMap;
                }).toList();
        }

        @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 0 * * ?")
        @Transactional
        public void autoCheckoutAtMidnight() {
                logger.info("Running automatic checkout task at midnight");
                List<Attendance> checkedInUsers = attendanceRepository.findByStatus("CHECKED_IN");

                for (Attendance attendance : checkedInUsers) {
                        try {
                                attendance.setCheckOutTime(LocalDateTime.now());
                                attendance.setStatus("CHECKED_OUT");

                                // Calculate duration and work hours
                                attendance.calculateDuration();

                                // Calculate overtime
                                attendance.calculateOvertime();

                                // Calculate final attendance status
                                attendance.calculateAttendanceStatus();

                                // Mark as auto-checked out (optional log info)
                                logger.info("Auto-checking out user: {} (ID: {})",
                                                attendance.getUser() != null ? attendance.getUser().getEmail()
                                                                : "Unknown",
                                                attendance.getId());

                                attendanceRepository.save(attendance);
                        } catch (Exception e) {
                                logger.error("Error checking out user during auto-checkout: " + attendance.getId(), e);
                        }
                }
        }
}
