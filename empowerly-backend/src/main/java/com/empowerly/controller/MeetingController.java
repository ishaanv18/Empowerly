package com.empowerly.controller;

import com.empowerly.dto.CreateMeetingRequest;
import com.empowerly.dto.MeetingResponse;
import com.empowerly.service.MeetingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class MeetingController {

    private final MeetingService meetingService;

    @PostMapping
    public ResponseEntity<MeetingResponse> createMeeting(
            @RequestBody CreateMeetingRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        MeetingResponse response = meetingService.createMeeting(request, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<MeetingResponse>> getUserMeetings(Authentication authentication) {
        String userId = authentication.getName();
        List<MeetingResponse> meetings = meetingService.getUserMeetings(userId);
        return ResponseEntity.ok(meetings);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<MeetingResponse>> getUpcomingMeetings(Authentication authentication) {
        String userId = authentication.getName();
        List<MeetingResponse> meetings = meetingService.getUpcomingMeetings(userId);
        return ResponseEntity.ok(meetings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeetingResponse> getMeetingById(@PathVariable String id) {
        MeetingResponse meeting = meetingService.getMeetingById(id);
        return ResponseEntity.ok(meeting);
    }

    @GetMapping("/link/{meetingLink}")
    public ResponseEntity<MeetingResponse> getMeetingByLink(@PathVariable String meetingLink) {
        MeetingResponse meeting = meetingService.getMeetingByLink(meetingLink);
        return ResponseEntity.ok(meeting);
    }

    @PostMapping("/{id}/invite")
    public ResponseEntity<Void> inviteParticipants(
            @PathVariable String id,
            @RequestBody Map<String, List<String>> request) {
        List<String> userIds = request.get("userIds");
        meetingService.inviteParticipants(id, userIds);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Void> joinMeeting(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        meetingService.joinMeeting(id, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveMeeting(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        meetingService.leaveMeeting(id, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> endMeeting(
            @PathVariable String id,
            Authentication authentication) {
        String userId = authentication.getName();
        meetingService.endMeeting(id, userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/participants/{userId}")
    public ResponseEntity<Void> updateParticipantStatus(
            @PathVariable String id,
            @PathVariable String userId,
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        meetingService.updateParticipantStatus(id, userId, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, String>> clearAllUserMeetings(Authentication authentication) {
        String userId = authentication.getName();
        meetingService.clearAllUserMeetings(userId);
        return ResponseEntity.ok(Map.of("message", "All meetings cleared successfully"));
    }
}
