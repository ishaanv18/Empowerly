package com.empowerly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewCycleRequest {
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // "ALL" or "SPECIFIC"
    private String targetScope = "ALL";

    // Employee IDs to include (only used when targetScope = "SPECIFIC")
    private List<String> targetEmployeeIds;
}
