package com.empowerly.controller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebRTCSignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/meeting/{meetingId}/offer")
    @SendTo("/topic/meeting/{meetingId}")
    public SignalMessage sendOffer(@DestinationVariable String meetingId, SignalMessage message) {
        return message;
    }

    @MessageMapping("/meeting/{meetingId}/answer")
    @SendTo("/topic/meeting/{meetingId}")
    public SignalMessage sendAnswer(@DestinationVariable String meetingId, SignalMessage message) {
        return message;
    }

    @MessageMapping("/meeting/{meetingId}/ice-candidate")
    @SendTo("/topic/meeting/{meetingId}")
    public SignalMessage sendIceCandidate(@DestinationVariable String meetingId, SignalMessage message) {
        return message;
    }

    @MessageMapping("/meeting/{meetingId}/join")
    @SendTo("/topic/meeting/{meetingId}")
    public SignalMessage userJoined(@DestinationVariable String meetingId, SignalMessage message) {
        message.setType("user-joined");
        return message;
    }

    @MessageMapping("/meeting/{meetingId}/leave")
    @SendTo("/topic/meeting/{meetingId}")
    public SignalMessage userLeft(@DestinationVariable String meetingId, SignalMessage message) {
        message.setType("user-left");
        return message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SignalMessage {
        private String type;
        private String from;
        private String to;
        private Object data;
    }
}
