package com.empowerly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HRReviewRequest {
    private Map<String, Integer> hrRatings;
    private String hrComment;
}
