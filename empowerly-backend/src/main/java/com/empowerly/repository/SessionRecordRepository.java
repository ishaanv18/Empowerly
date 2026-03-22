package com.empowerly.repository;

import com.empowerly.model.SessionRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SessionRecordRepository extends MongoRepository<SessionRecord, String> {
    List<SessionRecord> findByUserIdOrderByTimestampDesc(String userId);

    List<SessionRecord> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);

    List<SessionRecord> findByUserIdAndTimestampBetweenOrderByTimestampDesc(String userId, LocalDateTime start,
            LocalDateTime end);

    List<SessionRecord> findByActionOrderByTimestampDesc(String action);
}
