package com.empowerly.repository;

import com.empowerly.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    // Find messages in a conversation, ordered by timestamp descending
    Page<Message> findByConversationIdOrderByTimestampDesc(String conversationId, Pageable pageable);

    // Find all messages in a conversation
    List<Message> findByConversationIdOrderByTimestampAsc(String conversationId);

    // Count unread messages for a receiver
    long countByReceiverIdAndIsReadFalse(String receiverId);

    // Count unread messages in a conversation for a specific user
    long countByConversationIdAndReceiverIdAndIsReadFalse(String conversationId, String receiverId);

    // Find all messages where user is sender or receiver
    List<Message> findBySenderIdOrReceiverId(String senderId, String receiverId);

    // Find unread messages for a user in a conversation
    List<Message> findByConversationIdAndReceiverIdAndIsReadFalse(String conversationId, String receiverId);

    // Delete all messages in a conversation
    void deleteByConversationId(String conversationId);
}
