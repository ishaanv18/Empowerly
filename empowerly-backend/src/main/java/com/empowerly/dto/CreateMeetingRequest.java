package com.empowerly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMeetingRequest {
    private String title;
    private String description;
    private LocalDateTime scheduledTime;
    private Integer duration; // in minutes
    private List<String> participantIds;
}
