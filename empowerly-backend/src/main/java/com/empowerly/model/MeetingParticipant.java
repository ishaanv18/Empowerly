package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "meeting_participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeetingParticipant {

    @Id
    private String id;

    private String meetingId;
    private String userId;
    private ParticipantStatus status;
    private LocalDateTime invitedAt;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;

    public enum ParticipantStatus {
        INVITED,
        ACCEPTED,
        DECLINED,
        JOINED,
        LEFT
    }

    public MeetingParticipant(String meetingId, String userId) {
        this.meetingId = meetingId;
        this.userId = userId;
        this.status = ParticipantStatus.INVITED;
        this.invitedAt = LocalDateTime.now();
    }
}
