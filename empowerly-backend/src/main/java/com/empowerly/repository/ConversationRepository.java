package com.empowerly.repository;

import com.empowerly.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    // Find conversations where user is a participant
    List<Conversation> findByParticipantIdsContainingOrderByLastMessageTimeDesc(String userId);

    // Find conversation between two specific users
    @Query("{ 'participantIds': { $all: [?0, ?1] } }")
    Optional<Conversation> findByParticipantIds(String userId1, String userId2);

    // Check if conversation exists between two users
    @Query(value = "{ 'participantIds': { $all: [?0, ?1] } }", exists = true)
    boolean existsByParticipantIds(String userId1, String userId2);
}
