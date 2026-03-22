package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "payroll_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollEntry {
    @Id
    private String id;

    private String payrollId;
    private String employeeId;
    private String employeeName;

    // Salary Components
    private double basicSalary;
    private Map<String, Double> allowances; // HRA, DA, Travel, Medical, etc.
    private Map<String, Double> deductions; // Tax, PF, Penalties, etc.

    // Calculated Values
    private double grossSalary;
    private double netSalary;

    // Attendance Data
    private int workingDays;
    private int presentDays;
    private int paidLeaves;
    private int unpaidLeaves;
    private double overtimeHours;

    // Additional
    private double penalties;
    private String notes;
    private PayrollEntryStatus status; // DRAFT, GENERATED, APPROVED
}
