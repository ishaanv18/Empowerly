package com.empowerly.dto;

import com.empowerly.model.PayrollEntryStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollEntryResponse {
    private String id;
    private String payrollId;
    private String employeeId;
    private String employeeName;

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

    private double penalties;
    private String notes;
    private PayrollEntryStatus status;
}
