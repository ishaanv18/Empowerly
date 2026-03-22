package com.empowerly.service;

import com.empowerly.dto.ConversationResponse;
import com.empowerly.model.Conversation;
import com.empowerly.model.Message;
import com.empowerly.model.User;
import com.empowerly.repository.ConversationRepository;
import com.empowerly.repository.MessageRepository;
import com.empowerly.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Send a message from one user to another
     */
    @Transactional
    public Message sendMessage(String senderId, String receiverId, String content) {
        // Validate users exist
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Get or create conversation
        Conversation conversation = getOrCreateConversation(senderId, receiverId);

        // Create and save message
        Message message = new Message(senderId, receiverId, conversation.getId(), content);
        message = messageRepository.save(message);

        // Update conversation
        conversation.setLastMessage(content.length() > 50 ? content.substring(0, 50) + "..." : content);
        conversation.setLastMessageTime(LocalDateTime.now());
        conversation.incrementUnreadCount(receiverId);
        conversationRepository.save(conversation);

        return message;
    }

    /**
     * Get or create a conversation between two users
     */
    public Conversation getOrCreateConversation(String userId1, String userId2) {
        return conversationRepository.findByParticipantIds(userId1, userId2)
                .orElseGet(() -> {
                    Conversation newConversation = new Conversation(Arrays.asList(userId1, userId2));
                    return conversationRepository.save(newConversation);
                });
    }

    /**
     * Get all conversations for a user
     */
    public List<ConversationResponse> getConversations(String userId) {
        List<Conversation> conversations = conversationRepository
                .findByParticipantIdsContainingOrderByLastMessageTimeDesc(userId);

        return conversations.stream()
                .map(conv -> {
                    String otherUserId = conv.getOtherParticipant(userId);
                    User otherUser = userRepository.findById(otherUserId).orElse(null);

                    if (otherUser == null) {
                        return null;
                    }

                    return new ConversationResponse(
                            conv.getId(),
                            otherUser.getId(),
                            otherUser.getName(),
                            otherUser.getEmail(),
                            otherUser.getDepartment().toString(),
                            conv.getLastMessage(),
                            conv.getLastMessageTime(),
                            conv.getUnreadCountForUser(userId));
                })
                .filter(conv -> conv != null)
                .collect(Collectors.toList());
    }

    /**
     * Get messages in a conversation with pagination
     */
    public Page<Message> getMessages(String conversationId, String userId, int page, int size) {
        // Verify user is part of conversation
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conversation.getParticipantIds().contains(userId)) {
            throw new RuntimeException("User not authorized to view this conversation");
        }

        Pageable pageable = PageRequest.of(page, size);
        return messageRepository.findByConversationIdOrderByTimestampDesc(conversationId, pageable);
    }

    /**
     * Get all messages in a conversation (for initial load)
     */
    public List<Message> getAllMessages(String conversationId, String userId) {
        // Verify user is part of conversation
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conversation.getParticipantIds().contains(userId)) {
            throw new RuntimeException("User not authorized to view this conversation");
        }

        // Get all messages and filter out deleted ones for this user
        return messageRepository.findByConversationIdOrderByTimestampAsc(conversationId)
                .stream()
                .filter(msg -> !msg.isDeletedForUser(userId))
                .collect(Collectors.toList());
    }

    /**
     * Mark all messages in a conversation as read for a user
     */
    @Transactional
    public void markAsRead(String conversationId, String userId) {
        // Get unread messages
        List<Message> unreadMessages = messageRepository
                .findByConversationIdAndReceiverIdAndIsReadFalse(conversationId, userId);

        // Mark as read
        unreadMessages.forEach(msg -> msg.setRead(true));
        messageRepository.saveAll(unreadMessages);

        // Update conversation unread count
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        conversation.resetUnreadCount(userId);
        conversationRepository.save(conversation);
    }

    /**
     * Get total unread message count for a user
     */
    public long getUnreadCount(String userId) {
        return messageRepository.countByReceiverIdAndIsReadFalse(userId);
    }

    /**
     * Get unread count for a specific conversation
     */
    public long getConversationUnreadCount(String conversationId, String userId) {
        return messageRepository.countByConversationIdAndReceiverIdAndIsReadFalse(conversationId, userId);
    }

    /**
     * Delete message for a specific user only
     */
    @Transactional
    public void deleteMessageForUser(String messageId, String userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Mark message as deleted for this user
        message.deleteForUser(userId);
        messageRepository.save(message);
    }

    /**
     * Delete message for everyone (sender only)
     */
    @Transactional
    public void deleteMessageForEveryone(String messageId, String userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Only sender can delete for everyone
        if (!message.getSenderId().equals(userId)) {
            throw new RuntimeException("Only the sender can delete this message for everyone");
        }

        // Mark message as deleted for everyone
        message.setDeletedForEveryone(true);
        messageRepository.save(message);
    }

    /**
     * Clear all chats for a user (delete all messages and conversations for them)
     */
    @Transactional
    public void clearAllChatsForUser(String userId) {
        // Get all conversations for this user
        List<Conversation> conversations = conversationRepository
                .findByParticipantIdsContainingOrderByLastMessageTimeDesc(userId);

        // Delete all conversations where this user is a participant
        conversationRepository.deleteAll(conversations);

        // Also delete all messages where user is sender or receiver
        List<Message> userMessages = messageRepository.findBySenderIdOrReceiverId(userId, userId);
        messageRepository.deleteAll(userMessages);
    }
}
