package com.empowerly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewCycleRequest {
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
