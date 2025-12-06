package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "skill_suggestions")
public class SkillSuggestion {
    @Id
    private String id;
    private String userId;
    private String userName;
    private String userRole;
    private String department;
    private List<String> suggestedSkills = new ArrayList<>();
    private List<CourseRecommendation> recommendedCourses = new ArrayList<>();
    private LocalDateTime generatedAt;
    private String status = "ACTIVE"; // ACTIVE, COMPLETED
    private List<String> completedSkills = new ArrayList<>();
}
