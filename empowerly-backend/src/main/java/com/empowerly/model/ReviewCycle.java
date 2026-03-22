package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "review_cycles")
public class ReviewCycle {

    @Id
    private String id;
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private CycleStatus status;
    private String createdBy; // HR userId
    private LocalDateTime createdAt;

    public enum CycleStatus {
        DRAFT,
        ACTIVE,
        CLOSED
    }

    public ReviewCycle(String name, LocalDateTime startDate, LocalDateTime endDate, String createdBy) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = CycleStatus.DRAFT;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
    }
}
