package com.empowerly.service;

import com.empowerly.dto.AdminStatsResponse;
import com.empowerly.model.Attendance;
import com.empowerly.model.User;
import com.empowerly.repository.AttendanceRepository;
import com.empowerly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

        private final UserRepository userRepository;
        private final AttendanceRepository attendanceRepository;

        public AdminStatsResponse getSystemStats() {
                // Get all users
                List<User> allUsers = userRepository.findAll();

                // Count users by role
                long totalUsers = allUsers.size();
                long totalEmployees = allUsers.stream()
                                .filter(user -> user.getRole() == User.Role.EMPLOYEE)
                                .count();
                long totalHR = allUsers.stream()
                                .filter(user -> user.getRole() == User.Role.HR)
                                .count();
                long totalAdmins = allUsers.stream()
                                .filter(user -> user.getRole() == User.Role.ADMIN)
                                .count();

                // Count active users today (users who checked in today)
                LocalDate today = LocalDate.now();
                LocalDateTime startOfDay = today.atStartOfDay();
                LocalDateTime endOfDay = today.atTime(23, 59, 59);

                List<Attendance> todayAttendance = attendanceRepository.findByCheckInTimeBetween(startOfDay, endOfDay);
                long activeToday = todayAttendance.stream()
                                .filter(att -> "CHECKED_IN".equals(att.getStatus()))
                                .count();

                return new AdminStatsResponse(
                                totalUsers,
                                totalEmployees,
                                totalHR,
                                totalAdmins,
                                activeToday);
        }
}
