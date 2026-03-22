package com.empowerly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {

    private String id;
    private String otherUserId;
    private String otherUserName;
    private String otherUserEmail;
    private String otherUserDepartment;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private int unreadCount;
}
