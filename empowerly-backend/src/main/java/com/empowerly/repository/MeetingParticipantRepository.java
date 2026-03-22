package com.empowerly.repository;

import com.empowerly.model.MeetingParticipant;
import com.empowerly.model.MeetingParticipant.ParticipantStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingParticipantRepository extends MongoRepository<MeetingParticipant, String> {

    List<MeetingParticipant> findByMeetingId(String meetingId);

    List<MeetingParticipant> findByUserId(String userId);

    List<MeetingParticipant> findByUserIdAndStatus(String userId, ParticipantStatus status);

    Optional<MeetingParticipant> findByMeetingIdAndUserId(String meetingId, String userId);

    @Query("{ 'userId': ?0, 'status': 'INVITED' }")
    List<MeetingParticipant> findPendingInvitations(String userId);

    @Query(value = "{ 'meetingId': ?0, 'status': 'JOINED' }", count = true)
    Long countActiveParticipants(String meetingId);

    void deleteByMeetingId(String meetingId);
}
