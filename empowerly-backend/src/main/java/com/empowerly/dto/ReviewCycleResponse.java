package com.empowerly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewCycleResponse {
    private String id;
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private String createdBy;
    private String createdByName;
    private LocalDateTime createdAt;
    private Integer totalReviews;
    private Integer submittedReviews;
    private Integer approvedReviews;
}
