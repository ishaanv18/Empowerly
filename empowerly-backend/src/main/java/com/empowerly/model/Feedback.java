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
@Document(collection = "feedback")
public class Feedback {
    @Id
    private String id;
    private String subject;
    private String content;
    private String category; // WORKPLACE, BENEFITS, MANAGEMENT, OTHER
    private String status; // PENDING, REVIEWED, RESOLVED
    private LocalDateTime submittedAt;

    // Auto-deletion fields
    private Boolean isVisibleToEmployees = true;
    private LocalDateTime autoHideDate; // Set to submittedAt + 1 day
    private LocalDateTime hiddenAt; // When auto-hidden by scheduler

    private String anonymousToken; // Unique token for submitter to track feedback
    private List<FeedbackReply> publicReplies = new ArrayList<>();
    private FeedbackReply privateReply;
}
