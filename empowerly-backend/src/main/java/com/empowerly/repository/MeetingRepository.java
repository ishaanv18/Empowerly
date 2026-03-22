package com.empowerly.repository;

import com.empowerly.model.Meeting;
import com.empowerly.model.Meeting.MeetingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingRepository extends MongoRepository<Meeting, String> {

    List<Meeting> findByHostId(String hostId);

    List<Meeting> findByHostIdAndStatus(String hostId, MeetingStatus status);

    Optional<Meeting> findByMeetingLink(String meetingLink);

    @Query("{ 'hostId': ?0, 'scheduledTime': { $gt: ?1 }, 'status': 'SCHEDULED' }")
    List<Meeting> findUpcomingMeetingsByHost(String userId, LocalDateTime now);

    @Query("{ 'participantIds': ?0, 'scheduledTime': { $gt: ?1 }, 'status': 'SCHEDULED' }")
    List<Meeting> findUpcomingMeetingsByParticipant(String userId, LocalDateTime now);

    @Query("{ 'status': 'IN_PROGRESS' }")
    List<Meeting> findActiveMeetings();

    @Query("{ $or: [ { 'hostId': ?0 }, { 'participantIds': ?0 } ], 'scheduledTime': { $gte: ?1, $lte: ?2 } }")
    List<Meeting> findMeetingsByUserAndDateRange(String userId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("{ $or: [ { 'hostId': ?0 }, { 'participantIds': ?0 } ] }")
    List<Meeting> findAllMeetingsByUser(String userId);
}
