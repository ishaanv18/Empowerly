package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "token_usage")
public class TokenUsage {

    @Id
    private String id;

    @DBRef
    private User user;

    private LocalDate date;

    private int promptTokens;

    private int completionTokens;

    private int totalTokens;

    private String feature; // "chatbot", "skills", "motivation"

    private LocalDateTime createdAt;

    public TokenUsage(User user, LocalDate date, int promptTokens, int completionTokens, int totalTokens,
            String feature) {
        this.user = user;
        this.date = date;
        this.promptTokens = promptTokens;
        this.completionTokens = completionTokens;
        this.totalTokens = totalTokens;
        this.feature = feature;
        this.createdAt = LocalDateTime.now();
    }
}
