package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "salary_structures")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalaryStructure {
    @Id
    private String id;

    private String employeeId;

    // Salary Components
    private double basicSalary;
    private double hra; // House Rent Allowance
    private double da; // Dearness Allowance
    private double travelAllowance;
    private double medicalAllowance;
    private double otherAllowances;

    // Deduction Percentages
    private double taxPercentage;
    private double pfPercentage; // Provident Fund (default 12%)

    // Validity
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;

    // Metadata
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
