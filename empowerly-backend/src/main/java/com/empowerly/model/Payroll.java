package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "payrolls")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payroll {
    @Id
    private String id;

    private int month; // 1-12
    private int year;
    private PayrollStatus status; // DRAFT, PENDING_APPROVAL, APPROVED, REJECTED

    private String createdBy; // HR user ID
    private String approvedBy; // Admin user ID

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
