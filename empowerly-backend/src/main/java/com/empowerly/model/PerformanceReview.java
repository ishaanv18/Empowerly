package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "performance_reviews")
public class PerformanceReview {

    @Id
    private String id;
    private String employeeId;
    private String cycleId;

    // Employee self-assessment
    private Map<String, Integer> employeeRatings; // Communication, Teamwork, etc.
    private String employeeComment;
    private String achievements;
    private String challenges;
    private String goals;

    // HR evaluation
    private Map<String, Integer> hrRatings;
    private String hrComment;

    // Final score
    private Double finalScore;

    // Status tracking
    private ReviewStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;

    public enum ReviewStatus {
        PENDING,
        SUBMITTED,
        REVIEWED,
        APPROVED,
        REJECTED
    }

    public PerformanceReview(String employeeId, String cycleId) {
        this.employeeId = employeeId;
        this.cycleId = cycleId;
        this.status = ReviewStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }
}
