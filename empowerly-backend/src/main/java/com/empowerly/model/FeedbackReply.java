package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackReply {
    private String repliedBy;
    private String repliedById;
    private String content;
    private LocalDateTime repliedAt;
    private Boolean isPublic;
}
