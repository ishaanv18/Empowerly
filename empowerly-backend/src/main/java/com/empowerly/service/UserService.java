package com.empowerly.service;

import com.empowerly.model.User;
import com.empowerly.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final PayrollEntryRepository payrollEntryRepository;
    private final PayslipRepository payslipRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final PerformanceReviewRepository performanceReviewRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;
    private final MeetingRepository meetingRepository;
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final OTPRepository otpRepository;
    private final OfferLetterRepository offerLetterRepository;
    private final AppointmentLetterRepository appointmentLetterRepository;

    @Transactional
    public void deleteUserAndAllData(String userId) {
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ==================== MEETING DATA ====================
        // Delete meeting participations where user is a participant
        meetingParticipantRepository.findByUserId(userId)
                .forEach(meetingParticipantRepository::delete);

        // Delete meetings hosted by this user
        meetingRepository.findByHostId(userId)
                .forEach(meetingRepository::delete);

        // ==================== CHAT DATA ====================
        // Find and delete all conversations involving this user
        conversationRepository.findByParticipantIdsContainingOrderByLastMessageTimeDesc(userId)
                .forEach(conversation -> {
                    // Delete all messages in the conversation
                    messageRepository.deleteByConversationId(conversation.getId());
                    // Delete the conversation itself
                    conversationRepository.delete(conversation);
                });

        // ==================== LEAVE DATA ====================
        // Delete leave balance for all years
        leaveBalanceRepository.findAll().stream()
                .filter(lb -> lb.getUser().getId().equals(userId))
                .forEach(leaveBalanceRepository::delete);

        // Delete all leave requests (Leave uses 'employee' field)
        leaveRepository.findByEmployee(user).forEach(leaveRepository::delete);

        // ==================== ATTENDANCE DATA ====================
        // Delete all attendance records (Attendance uses 'user' field)
        attendanceRepository.findByUser(user).forEach(attendanceRepository::delete);

        // ==================== PAYROLL DATA ====================
        // Delete all payroll entries (uses employeeId string)
        payrollEntryRepository.findByEmployeeId(userId)
                .forEach(payrollEntryRepository::delete);

        // Delete all payslips (uses employeeId string)
        payslipRepository.findByEmployeeIdOrderByYearDescMonthDesc(userId)
                .forEach(payslipRepository::delete);

        // Delete salary structures (uses employeeId string)
        salaryStructureRepository.findByEmployeeId(userId)
                .forEach(salaryStructureRepository::delete);

        // ==================== PERFORMANCE REVIEW DATA ====================
        // Delete all performance reviews (uses employeeId string)
        performanceReviewRepository.findByEmployeeId(userId)
                .forEach(performanceReviewRepository::delete);

        // ==================== HR DOCUMENTS ====================
        // Delete offer letters by employee name (since repository uses name-based
        // search)
        offerLetterRepository.findByEmployeeNameContainingIgnoreCase(user.getName())
                .forEach(offerLetterRepository::delete);

        // Delete appointment letters by employee name
        appointmentLetterRepository.findByEmployeeNameContainingIgnoreCase(user.getName())
                .forEach(appointmentLetterRepository::delete);

        // ==================== AUTHENTICATION DATA ====================
        // Delete OTP records for this user's email
        otpRepository.findByEmail(user.getEmail())
                .ifPresent(otpRepository::delete);

        // ==================== FINALLY DELETE USER ====================
        // Delete the user record itself
        userRepository.delete(user);
    }
}
