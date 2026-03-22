package com.empowerly.controller;

import com.empowerly.config.JwtUtil;
import com.empowerly.dto.ConversationResponse;
import com.empowerly.dto.SendMessageRequest;
import com.empowerly.model.Message;
import com.empowerly.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private JwtUtil jwtUtil;

    private String getUserIdFromToken(String token) {
        String jwtToken = token.replace("Bearer ", "");
        return jwtUtil.getUserIdFromToken(jwtToken);
    }

    /**
     * Send a message
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody SendMessageRequest request) {
        try {
            String senderId = getUserIdFromToken(token);
            Message message = chatService.sendMessage(senderId, request.getReceiverId(), request.getContent());
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get all conversations for current user
     */
    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(@RequestHeader("Authorization") String token) {
        try {
            String userId = getUserIdFromToken(token);
            List<ConversationResponse> conversations = chatService.getConversations(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get messages in a conversation (paginated)
     */
    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<?> getMessages(
            @RequestHeader("Authorization") String token,
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            String userId = getUserIdFromToken(token);
            Page<Message> messages = chatService.getMessages(conversationId, userId, page, size);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get all messages in a conversation (for initial load)
     */
    @GetMapping("/messages/{conversationId}/all")
    public ResponseEntity<?> getAllMessages(
            @RequestHeader("Authorization") String token,
            @PathVariable String conversationId) {
        try {
            String userId = getUserIdFromToken(token);
            List<Message> messages = chatService.getAllMessages(conversationId, userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Mark conversation as read
     */
    @PostMapping("/read/{conversationId}")
    public ResponseEntity<?> markAsRead(
            @RequestHeader("Authorization") String token,
            @PathVariable String conversationId) {
        try {
            String userId = getUserIdFromToken(token);
            chatService.markAsRead(conversationId, userId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Marked as read");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get unread message count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@RequestHeader("Authorization") String token) {
        try {
            String userId = getUserIdFromToken(token);
            long count = chatService.getUnreadCount(userId);

            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Delete message for current user only
     */
    @DeleteMapping("/messages/{messageId}/delete-for-me")
    public ResponseEntity<?> deleteMessageForMe(
            @RequestHeader("Authorization") String token,
            @PathVariable String messageId) {
        try {
            String userId = getUserIdFromToken(token);
            chatService.deleteMessageForUser(messageId, userId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Message deleted for you");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Delete message for everyone (sender only)
     */
    @DeleteMapping("/messages/{messageId}/delete-for-everyone")
    public ResponseEntity<?> deleteMessageForEveryone(
            @RequestHeader("Authorization") String token,
            @PathVariable String messageId) {
        try {
            String userId = getUserIdFromToken(token);
            chatService.deleteMessageForEveryone(messageId, userId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Message deleted for everyone");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Clear all chats for current user
     */
    @DeleteMapping("/clear-all")
    public ResponseEntity<?> clearAllChats(@RequestHeader("Authorization") String token) {
        try {
            String userId = getUserIdFromToken(token);
            chatService.clearAllChatsForUser(userId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "All chats cleared successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
