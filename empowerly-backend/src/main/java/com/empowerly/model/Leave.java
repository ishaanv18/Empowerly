package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "leaves")
public class Leave {

    @Id
    private String id;

    @DBRef
    private User employee;

    private LeaveType leaveType = LeaveType.CASUAL_LEAVE;

    private LocalDate startDate;

    private LocalDate endDate;

    private int numberOfDays;

    private String reason;

    private LeaveStatus status = LeaveStatus.PENDING;

    private Boolean isUnpaid = false;

    private String hrRemarks;

    @DBRef
    private User approvedBy;

    private LocalDateTime approvedAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public void calculateDuration() {
        if (startDate != null && endDate != null) {
            this.numberOfDays = (int) ChronoUnit.DAYS.between(startDate, endDate) + 1;
        }
    }

    public enum LeaveType {
        CASUAL_LEAVE,
        SICK_LEAVE,
        PAID_LEAVE
    }

    public enum LeaveStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
