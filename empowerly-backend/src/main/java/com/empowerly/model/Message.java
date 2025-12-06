package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    private String id;

    private String senderId;

    private String receiverId;

    private String conversationId;

    private String content;

    @CreatedDate
    private LocalDateTime timestamp;

    private boolean isRead = false;

    // Deletion tracking
    private boolean deletedForEveryone = false;
    private List<String> deletedForUsers = new ArrayList<>(); // Users who deleted this message for themselves

    // Constructor without id for new messages
    public Message(String senderId, String receiverId, String conversationId, String content) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.conversationId = conversationId;
        this.content = content;
        this.timestamp = LocalDateTime.now();
        this.isRead = false;
        this.deletedForEveryone = false;
        this.deletedForUsers = new ArrayList<>();
    }

    // Helper method to check if message is deleted for a specific user
    public boolean isDeletedForUser(String userId) {
        return deletedForEveryone || (deletedForUsers != null && deletedForUsers.contains(userId));
    }

    // Helper method to mark message as deleted for a user
    public void deleteForUser(String userId) {
        if (deletedForUsers == null) {
            deletedForUsers = new ArrayList<>();
        }
        if (!deletedForUsers.contains(userId)) {
            deletedForUsers.add(userId);
        }
    }
}
