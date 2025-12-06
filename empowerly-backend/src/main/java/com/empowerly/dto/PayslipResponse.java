package com.empowerly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayslipResponse {
    private String id;
    private String employeeId;
    private String employeeName;

    private int month;
    private int year;

    private double basicSalary;
    private Map<String, Double> allowances;
    private Map<String, Double> deductions;
    private double grossSalary;
    private double netSalary;

    private int workingDays;
    private int presentDays;
    private int paidLeaves;
    private int unpaidLeaves;
    private double overtimeHours;

    private LocalDateTime generatedAt;
    private String pdfUrl;
}
