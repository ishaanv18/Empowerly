package com.empowerly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSelfAssessmentRequest {
    private String cycleId;
    private Map<String, Integer> ratings; // Communication, Teamwork, TechnicalSkills, Attendance, ProblemSolving
    private String comment;
    private String achievements;
    private String challenges;
    private String goals;
}
