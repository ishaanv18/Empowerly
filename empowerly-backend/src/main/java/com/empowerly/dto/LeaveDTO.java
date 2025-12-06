package com.empowerly.dto;

import com.empowerly.model.Leave;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveDTO {
    private String id;
    private String employeeId;
    private String userName;
    private String userEmail;
    private String department;
    private Leave.LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private int numberOfDays;
    private String reason;
    private Leave.LeaveStatus status;
    private Boolean isUnpaid;
    private String hrRemarks;
    private String approvedBy;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static LeaveDTO fromLeave(Leave leave) {
        LeaveDTO dto = new LeaveDTO();
        dto.setId(leave.getId());
        dto.setLeaveType(leave.getLeaveType());
        dto.setStartDate(leave.getStartDate());
        dto.setEndDate(leave.getEndDate());
        dto.setNumberOfDays(leave.getNumberOfDays());
        dto.setReason(leave.getReason());
        dto.setStatus(leave.getStatus());
        dto.setIsUnpaid(leave.getIsUnpaid());
        dto.setHrRemarks(leave.getHrRemarks());
        dto.setApprovedAt(leave.getApprovedAt());
        dto.setCreatedAt(leave.getCreatedAt());
        dto.setUpdatedAt(leave.getUpdatedAt());

        // Set employee details
        if (leave.getEmployee() != null) {
            dto.setEmployeeId(leave.getEmployee().getId());
            dto.setUserName(leave.getEmployee().getName());
            dto.setUserEmail(leave.getEmployee().getEmail());
            dto.setDepartment(
                    leave.getEmployee().getDepartment() != null ? leave.getEmployee().getDepartment().toString()
                            : null);
        }

        // Set approver details
        if (leave.getApprovedBy() != null) {
            dto.setApprovedBy(leave.getApprovedBy().getName());
        }

        return dto;
    }
}
