package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "leave_balances")
public class LeaveBalance {

    @Id
    private String id;

    @DBRef
    private User user;

    private int year;

    // Casual Leave
    private int casualLeaveTotal = 10;
    private int casualLeaveUsed = 0;

    // Sick Leave
    private int sickLeaveTotal = 7;
    private int sickLeaveUsed = 0;

    // Paid Leave
    private int paidLeaveTotal = 5;
    private int paidLeaveUsed = 0;

    public int getRemainingCasualLeave() {
        return casualLeaveTotal - casualLeaveUsed;
    }

    public int getRemainingSickLeave() {
        return sickLeaveTotal - sickLeaveUsed;
    }

    public int getRemainingPaidLeave() {
        return paidLeaveTotal - paidLeaveUsed;
    }

    public boolean hasAvailableLeave(Leave.LeaveType leaveType, int days) {
        switch (leaveType) {
            case CASUAL_LEAVE:
                return getRemainingCasualLeave() >= days;
            case SICK_LEAVE:
                return getRemainingSickLeave() >= days;
            case PAID_LEAVE:
                return getRemainingPaidLeave() >= days;
            default:
                return false;
        }
    }

    public void deductLeave(Leave.LeaveType leaveType, int days) {
        switch (leaveType) {
            case CASUAL_LEAVE:
                casualLeaveUsed += days;
                break;
            case SICK_LEAVE:
                sickLeaveUsed += days;
                break;
            case PAID_LEAVE:
                paidLeaveUsed += days;
                break;
        }
    }
}
