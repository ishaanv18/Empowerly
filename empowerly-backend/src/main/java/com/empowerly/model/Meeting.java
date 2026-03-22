package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "meetings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Meeting {

    @Id
    private String id;

    private String title;
    private String description;
    private String hostId;
    private LocalDateTime scheduledTime;
    private Integer duration; // in minutes
    private MeetingStatus status;
    private String meetingLink;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private List<String> participantIds = new ArrayList<>();

    public enum MeetingStatus {
        SCHEDULED,
        IN_PROGRESS,
        ENDED,
        CANCELLED
    }

    public Meeting(String title, String description, String hostId, LocalDateTime scheduledTime, Integer duration) {
        this.title = title;
        this.description = description;
        this.hostId = hostId;
        this.scheduledTime = scheduledTime;
        this.duration = duration;
        this.status = MeetingStatus.SCHEDULED;
        this.createdAt = LocalDateTime.now();
    }
}
