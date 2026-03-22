package com.empowerly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePayrollEntryRequest {
    private double basicSalary;
    private Map<String, Double> allowances;
    private Map<String, Double> deductions;
    private int workingDays;
    private int presentDays;
    private int paidLeaves;
    private int unpaidLeaves;
    private double overtimeHours;
    private double penalties;
    private String notes;
}
