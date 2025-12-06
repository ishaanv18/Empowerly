package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {

    @Id
    private String id;

    @Indexed
    private List<String> participantIds; // Always 2 users

    private String lastMessage;

    private LocalDateTime lastMessageTime;

    private Map<String, Integer> unreadCount = new HashMap<>(); // userId -> count

    // Constructor for new conversation
    public Conversation(List<String> participantIds) {
        this.participantIds = participantIds;
        this.lastMessageTime = LocalDateTime.now();
        this.unreadCount = new HashMap<>();
        participantIds.forEach(id -> this.unreadCount.put(id, 0));
    }

    // Helper method to get unread count for a user
    public int getUnreadCountForUser(String userId) {
        return unreadCount.getOrDefault(userId, 0);
    }

    // Helper method to increment unread count
    public void incrementUnreadCount(String userId) {
        unreadCount.put(userId, unreadCount.getOrDefault(userId, 0) + 1);
    }

    // Helper method to reset unread count
    public void resetUnreadCount(String userId) {
        unreadCount.put(userId, 0);
    }

    // Helper method to get the other participant
    public String getOtherParticipant(String currentUserId) {
        return participantIds.stream()
                .filter(id -> !id.equals(currentUserId))
                .findFirst()
                .orElse(null);
    }
}
