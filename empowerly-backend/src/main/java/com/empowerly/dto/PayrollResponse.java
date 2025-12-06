package com.empowerly.dto;

import com.empowerly.model.PayrollStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollResponse {
    private String id;
    private int month;
    private int year;
    private PayrollStatus status;

    private String createdBy;
    private String createdByName;
    private String approvedBy;
    private String approvedByName;

    private int totalEmployees;
    private double totalAmount;

    private LocalDateTime generatedAt;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;

    private String hrNotes;
    private String adminNotes;
    private String rejectionReason;
}
