package com.empowerly.dto;

import com.empowerly.model.PerformanceReview;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReviewResponse {
    private String id;
    private String employeeId;
    private String employeeName;
    private String cycleId;
    private String cycleName;

    // Employee self-assessment
    private Map<String, Integer> employeeRatings;
    private String employeeComment;
    private String achievements;
    private String challenges;
    private String goals;

    // HR evaluation
    private Map<String, Integer> hrRatings;
    private String hrComment;

    // Final score
    private Double finalScore;

    // Status
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
}
