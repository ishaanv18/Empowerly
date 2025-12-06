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
@Document(collection = "motivation_posts")
public class MotivationPost {
    @Id
    private String id;
    private String authorId;
    private String authorName;
    private String authorRole;
    private String content;
    private String category; // ACHIEVEMENT, LEARNING, QUOTE, ANNOUNCEMENT
    private List<String> likes = new ArrayList<>(); // User IDs who liked
    private List<MotivationComment> comments = new ArrayList<>();
    private LocalDateTime createdAt;
    private Boolean isHRPost = false;
}
