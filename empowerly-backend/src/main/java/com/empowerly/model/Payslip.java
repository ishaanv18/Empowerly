package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "payslips")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payslip {
    @Id
    private String id;

    private String payrollEntryId;
    private String employeeId;
    private String employeeName;

    private int month;
    private int year;

    // Salary Details
    private double basicSalary;
    private Map<String, Double> allowances;
    private Map<String, Double> deductions;
    private double grossSalary;
    private double netSalary;

    // Attendance Details
    private int workingDays;
    private int presentDays;
    private int paidLeaves;
    private int unpaidLeaves;
    private double overtimeHours;

    // Metadata
    private LocalDateTime generatedAt;
    private LocalDateTime downloadedAt;
    private String pdfUrl; // Optional: path to generated PDF
}
