package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseRecommendation {
    private String title;
    private String platform;
    private String url;
    private String description;
    private String duration;
    private String level; // Beginner, Intermediate, Advanced
}
