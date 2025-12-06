package com.empowerly.service;

import com.empowerly.dto.CreateMeetingRequest;
import com.empowerly.dto.MeetingResponse;
import com.empowerly.model.Meeting;
import com.empowerly.model.MeetingParticipant;
import com.empowerly.model.User;
import com.empowerly.repository.MeetingParticipantRepository;
import com.empowerly.repository.MeetingRepository;
import com.empowerly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository participantRepository;
    private final UserRepository userRepository;

    public MeetingResponse createMeeting(CreateMeetingRequest request, String hostId) {
        // Create meeting
        Meeting meeting = new Meeting();
        meeting.setTitle(request.getTitle());
        meeting.setDescription(request.getDescription());
        meeting.setHostId(hostId);
        meeting.setScheduledTime(request.getScheduledTime());
        meeting.setDuration(request.getDuration());
        meeting.setStatus(Meeting.MeetingStatus.SCHEDULED);
        meeting.setMeetingLink(generateMeetingLink());
        meeting.setCreatedAt(LocalDateTime.now());

        // Add participant IDs to meeting
        if (request.getParticipantIds() != null && !request.getParticipantIds().isEmpty()) {
            List<String> participantIds = new ArrayList<>();
            for (String participantId : request.getParticipantIds()) {
                if (!participantId.equals(hostId)) {
                    participantIds.add(participantId);
                }
            }
            meeting.setParticipantIds(participantIds);
        }

        meeting = meetingRepository.save(meeting);

        // Create participant records
        if (request.getParticipantIds() != null && !request.getParticipantIds().isEmpty()) {
            for (String participantId : request.getParticipantIds()) {
                if (!participantId.equals(hostId)) {
                    MeetingParticipant participant = new MeetingParticipant(meeting.getId(), participantId);
                    participantRepository.save(participant);
                }
            }
        }

        return convertToResponse(meeting);
    }

    public List<MeetingResponse> getUserMeetings(String userId) {
        List<Meeting> meetings = meetingRepository.findAllMeetingsByUser(userId);

        return meetings.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<MeetingResponse> getUpcomingMeetings(String userId) {
        LocalDateTime now = LocalDateTime.now();
        List<Meeting> hostMeetings = meetingRepository.findUpcomingMeetingsByHost(userId, now);
        List<Meeting> participantMeetings = meetingRepository.findUpcomingMeetingsByParticipant(userId, now);

        hostMeetings.addAll(participantMeetings);

        return hostMeetings.stream()
                .distinct()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public MeetingResponse getMeetingById(String meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        return convertToResponse(meeting);
    }

    public MeetingResponse getMeetingByLink(String meetingLink) {
        Meeting meeting = meetingRepository.findByMeetingLink(meetingLink)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        return convertToResponse(meeting);
    }

    public void inviteParticipants(String meetingId, List<String> userIds) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        List<String> currentParticipants = meeting.getParticipantIds();
        if (currentParticipants == null) {
            currentParticipants = new ArrayList<>();
        }

        for (String userId : userIds) {
            // Check if already invited
            if (!currentParticipants.contains(userId) &&
                    participantRepository.findByMeetingIdAndUserId(meetingId, userId).isEmpty()) {

                currentParticipants.add(userId);
                MeetingParticipant participant = new MeetingParticipant(meetingId, userId);
                participantRepository.save(participant);
            }
        }

        meeting.setParticipantIds(currentParticipants);
        meetingRepository.save(meeting);
    }

    public void joinMeeting(String meetingId, String userId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        // Update meeting status if first participant
        if (meeting.getStatus() == Meeting.MeetingStatus.SCHEDULED) {
            meeting.setStatus(Meeting.MeetingStatus.IN_PROGRESS);
            meeting.setStartedAt(LocalDateTime.now());
            meetingRepository.save(meeting);
        }

        // Update participant status
        MeetingParticipant participant = participantRepository
                .findByMeetingIdAndUserId(meetingId, userId)
                .orElseGet(() -> new MeetingParticipant(meetingId, userId));

        participant.setStatus(MeetingParticipant.ParticipantStatus.JOINED);
        participant.setJoinedAt(LocalDateTime.now());
        participantRepository.save(participant);
    }

    public void leaveMeeting(String meetingId, String userId) {
        MeetingParticipant participant = participantRepository
                .findByMeetingIdAndUserId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        participant.setStatus(MeetingParticipant.ParticipantStatus.LEFT);
        participant.setLeftAt(LocalDateTime.now());
        participantRepository.save(participant);

        // Don't auto-end meeting - let users rejoin until host ends it or duration
        // expires
    }

    public void endMeeting(String meetingId, String hostId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        if (!meeting.getHostId().equals(hostId)) {
            throw new RuntimeException("Only host can end the meeting");
        }

        meeting.setStatus(Meeting.MeetingStatus.ENDED);
        meeting.setEndedAt(LocalDateTime.now());
        meetingRepository.save(meeting);

        // Update all joined participants to left
        List<MeetingParticipant> participants = participantRepository.findByMeetingId(meetingId);
        for (MeetingParticipant participant : participants) {
            if (participant.getStatus() == MeetingParticipant.ParticipantStatus.JOINED) {
                participant.setStatus(MeetingParticipant.ParticipantStatus.LEFT);
                participant.setLeftAt(LocalDateTime.now());
            }
        }
        participantRepository.saveAll(participants);
    }

    public void updateParticipantStatus(String meetingId, String userId, String status) {
        MeetingParticipant participant = participantRepository
                .findByMeetingIdAndUserId(meetingId, userId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        participant.setStatus(MeetingParticipant.ParticipantStatus.valueOf(status));
        participantRepository.save(participant);
    }

    public void clearAllUserMeetings(String userId) {
        // Find all meetings where user is host or participant
        List<Meeting> userMeetings = meetingRepository.findAllMeetingsByUser(userId);

        // Delete meetings where user is the host
        List<Meeting> hostedMeetings = userMeetings.stream()
                .filter(meeting -> meeting.getHostId().equals(userId))
                .collect(Collectors.toList());

        for (Meeting meeting : hostedMeetings) {
            // Delete all participants for this meeting
            participantRepository.deleteByMeetingId(meeting.getId());
            // Delete the meeting itself
            meetingRepository.delete(meeting);
        }

        // For meetings where user is just a participant, remove their participant
        // record
        List<MeetingParticipant> participantRecords = participantRepository.findByUserId(userId);
        participantRepository.deleteAll(participantRecords);
    }

    private String generateMeetingLink() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    private MeetingResponse convertToResponse(Meeting meeting) {
        MeetingResponse response = new MeetingResponse();
        response.setId(meeting.getId());
        response.setTitle(meeting.getTitle());
        response.setDescription(meeting.getDescription());
        response.setHostId(meeting.getHostId());
        response.setScheduledTime(meeting.getScheduledTime());
        response.setDuration(meeting.getDuration());
        response.setStatus(meeting.getStatus());
        response.setMeetingLink(meeting.getMeetingLink());
        response.setCreatedAt(meeting.getCreatedAt());
        response.setStartedAt(meeting.getStartedAt());
        response.setEndedAt(meeting.getEndedAt());

        // Get host name
        userRepository.findById(meeting.getHostId()).ifPresent(host -> response.setHostName(host.getName()));

        // Get participants
        List<MeetingParticipant> participants = participantRepository.findByMeetingId(meeting.getId());
        List<MeetingResponse.ParticipantInfo> participantInfos = participants.stream()
                .map(p -> {
                    MeetingResponse.ParticipantInfo info = new MeetingResponse.ParticipantInfo();
                    info.setUserId(p.getUserId());
                    info.setStatus(p.getStatus().name());
                    info.setJoinedAt(p.getJoinedAt());

                    userRepository.findById(p.getUserId()).ifPresent(user -> info.setUserName(user.getName()));

                    return info;
                })
                .collect(Collectors.toList());

        response.setParticipants(participantInfos);
        response.setActiveParticipantCount(
                (int) participantInfos.stream()
                        .filter(p -> "JOINED".equals(p.getStatus()))
                        .count());

        return response;
    }
}
