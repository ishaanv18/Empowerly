package com.empowerly.service;

import com.empowerly.dto.LeaveRequest;
import com.empowerly.model.Attendance;
import com.empowerly.model.Leave;
import com.empowerly.model.LeaveBalance;
import com.empowerly.model.User;
import com.empowerly.repository.AttendanceRepository;
import com.empowerly.repository.LeaveBalanceRepository;
import com.empowerly.repository.LeaveRepository;
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

@Service
public class LeaveService {

    private static final Logger logger = LoggerFactory.getLogger(LeaveService.class);

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Transactional
    public Leave applyLeave(String userId, LeaveRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date cannot be before start date");
        }

        // Check for overlapping leaves
        if (hasOverlappingLeaves(user, request.getStartDate(), request.getEndDate())) {
            throw new RuntimeException("You already have a leave request for these dates");
        }

        Leave leave = new Leave();
        leave.setEmployee(user);
        leave.setLeaveType(request.getLeaveType() != null ? request.getLeaveType() : Leave.LeaveType.CASUAL_LEAVE);
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setReason(request.getReason());
        leave.setStatus(Leave.LeaveStatus.PENDING);

        // Calculate duration
        leave.calculateDuration();

        // Get or create leave balance for current year
        int currentYear = LocalDate.now().getYear();
        LeaveBalance balance = getOrCreateLeaveBalance(user, currentYear);

        // Check if sufficient leave available
        if (!balance.hasAvailableLeave(leave.getLeaveType(), leave.getNumberOfDays())) {
            leave.setIsUnpaid(true);
            logger.warn("Insufficient leave balance for user: {}. Marking as unpaid.", user.getEmail());
        }

        Leave saved = leaveRepository.save(leave);
        logger.info("Leave application submitted by: {} for dates {} to {} ({} days, type: {}, unpaid: {})",
                user.getEmail(), request.getStartDate(), request.getEndDate(),
                leave.getNumberOfDays(), leave.getLeaveType(), leave.getIsUnpaid());

        return saved;
    }

    public List<Leave> getMyLeaves(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return leaveRepository.findByEmployeeOrderByCreatedAtDesc(user);
    }

    public List<Leave> getPendingLeaves() {
        return leaveRepository.findByStatusOrderByCreatedAtAsc(Leave.LeaveStatus.PENDING);
    }

    public List<Leave> getAllLeaves() {
        return leaveRepository.findAll();
    }

    @Transactional
    public Leave approveLeave(String leaveId, String hrUserId, String remarks) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        User hrUser = userRepository.findById(hrUserId)
                .orElseThrow(() -> new RuntimeException("HR user not found"));

        // Verify HR role
        if (hrUser.getRole() != User.Role.HR && hrUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only HR or Admin can approve leaves");
        }

        if (leave.getStatus() != Leave.LeaveStatus.PENDING) {
            throw new RuntimeException("Leave is already " + leave.getStatus());
        }

        leave.setStatus(Leave.LeaveStatus.APPROVED);
        leave.setHrRemarks(remarks);
        leave.setApprovedBy(hrUser);
        leave.setApprovedAt(LocalDateTime.now());

        // Deduct leave from balance if not unpaid
        if (!leave.getIsUnpaid()) {
            int currentYear = LocalDate.now().getYear();
            LeaveBalance balance = getOrCreateLeaveBalance(leave.getEmployee(), currentYear);
            balance.deductLeave(leave.getLeaveType(), leave.getNumberOfDays());
            leaveBalanceRepository.save(balance);
        }

        // Mark attendance as LEAVE for approved dates
        markAttendanceForLeave(leave);

        Leave saved = leaveRepository.save(leave);
        logger.info("Leave approved by: {} for employee: {} ({} days deducted from {})",
                hrUser.getEmail(), leave.getEmployee().getEmail(),
                leave.getNumberOfDays(), leave.getLeaveType());

        return saved;
    }

    @Transactional
    public Leave rejectLeave(String leaveId, String hrUserId, String remarks) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        User hrUser = userRepository.findById(hrUserId)
                .orElseThrow(() -> new RuntimeException("HR user not found"));

        // Verify HR role
        if (hrUser.getRole() != User.Role.HR && hrUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only HR or Admin can reject leaves");
        }

        if (leave.getStatus() != Leave.LeaveStatus.PENDING) {
            throw new RuntimeException("Leave is already " + leave.getStatus());
        }

        leave.setStatus(Leave.LeaveStatus.REJECTED);
        leave.setHrRemarks(remarks);
        leave.setApprovedBy(hrUser);
        leave.setApprovedAt(LocalDateTime.now());

        Leave saved = leaveRepository.save(leave);
        logger.info("Leave rejected by: {} for employee: {}", hrUser.getEmail(), leave.getEmployee().getEmail());

        return saved;
    }

    @Transactional
    public void revokeLeave(String leaveId, String userId) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        // Verify the leave belongs to the user
        if (!leave.getEmployee().getId().equals(userId)) {
            throw new RuntimeException("You can only cancel your own leave requests");
        }

        // Only pending leaves can be revoked
        if (leave.getStatus() != Leave.LeaveStatus.PENDING) {
            throw new RuntimeException("Only pending leave requests can be cancelled");
        }

        // Delete the leave request
        leaveRepository.delete(leave);
        logger.info("Leave request cancelled by user: {} for leave ID: {}", userId, leaveId);
    }

    public Leave getLeaveById(String leaveId) {
        return leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));
    }

    public LeaveBalance getLeaveBalance(String userId, int year) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return getOrCreateLeaveBalance(user, year);
    }

    public Map<String, Object> getLeaveReport(String userId, int year) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LeaveBalance balance = getOrCreateLeaveBalance(user, year);
        List<Leave> leaves = leaveRepository.findByEmployeeOrderByCreatedAtDesc(user);

        // Filter leaves for the specified year
        List<Leave> yearLeaves = leaves.stream()
                .filter(l -> l.getStartDate().getYear() == year)
                .toList();

        Map<String, Object> report = new HashMap<>();
        report.put("leaveBalance", balance);
        report.put("leaveHistory", yearLeaves);
        report.put("totalLeaveTaken",
                balance.getCasualLeaveUsed() + balance.getSickLeaveUsed() + balance.getPaidLeaveUsed());
        report.put("totalLeaveRemaining",
                balance.getRemainingCasualLeave() + balance.getRemainingSickLeave() + balance.getRemainingPaidLeave());

        long approvedCount = yearLeaves.stream().filter(l -> l.getStatus() == Leave.LeaveStatus.APPROVED).count();
        long rejectedCount = yearLeaves.stream().filter(l -> l.getStatus() == Leave.LeaveStatus.REJECTED).count();
        long pendingCount = yearLeaves.stream().filter(l -> l.getStatus() == Leave.LeaveStatus.PENDING).count();

        report.put("approvedCount", approvedCount);
        report.put("rejectedCount", rejectedCount);
        report.put("pendingCount", pendingCount);

        return report;
    }

    private LeaveBalance getOrCreateLeaveBalance(User user, int year) {
        return leaveBalanceRepository.findByUserAndYear(user, year)
                .orElseGet(() -> {
                    LeaveBalance newBalance = new LeaveBalance();
                    newBalance.setUser(user);
                    newBalance.setYear(year);
                    return leaveBalanceRepository.save(newBalance);
                });
    }

    private boolean hasOverlappingLeaves(User user, LocalDate startDate, LocalDate endDate) {
        List<Leave> existingLeaves = leaveRepository.findByEmployeeOrderByCreatedAtDesc(user);

        return existingLeaves.stream()
                .filter(l -> l.getStatus() != Leave.LeaveStatus.REJECTED)
                .anyMatch(l -> {
                    return !(endDate.isBefore(l.getStartDate()) || startDate.isAfter(l.getEndDate()));
                });
    }

    private void markAttendanceForLeave(Leave leave) {
        LocalDate currentDate = leave.getStartDate();

        while (!currentDate.isAfter(leave.getEndDate())) {
            // Create attendance record for each leave day
            Attendance attendance = new Attendance();
            attendance.setUser(leave.getEmployee());
            attendance.setDate(currentDate);
            attendance.setCheckInTime(LocalDateTime.of(currentDate, LocalTime.of(9, 0)));
            attendance.setCheckOutTime(LocalDateTime.of(currentDate, LocalTime.of(17, 0)));
            attendance.setStatus("LEAVE");
            attendance.setAttendanceStatus("LEAVE");
            attendance.setDurationMinutes(480L); // 8 hours
            attendance.setTotalWorkHours(8.0);
            attendance.setIsLate(false);
            attendance.setIsOvertime(false);
            attendance.setOvertimeMinutes(0L);

            attendanceRepository.save(attendance);
            logger.debug("Marked attendance as LEAVE for user: {} on date: {}",
                    leave.getEmployee().getEmail(), currentDate);

            currentDate = currentDate.plusDays(1);
        }
    }
}
