package com.empowerly.dto;

import com.empowerly.model.Meeting.MeetingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeetingResponse {
    private String id;
    private String title;
    private String description;
    private String hostId;
    private String hostName;
    private LocalDateTime scheduledTime;
    private Integer duration;
    private MeetingStatus status;
    private String meetingLink;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private List<ParticipantInfo> participants;
    private Integer activeParticipantCount;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantInfo {
        private String userId;
        private String userName;
        private String status;
        private LocalDateTime joinedAt;
    }
}
