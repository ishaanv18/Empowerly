package com.empowerly.repository;

import com.empowerly.model.LoginAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoginAttemptRepository extends MongoRepository<LoginAttempt, String> {
    List<LoginAttempt> findByEmailOrderByLoginTimeDesc(String email);

    List<LoginAttempt> findByUserIdOrderByLoginTimeDesc(String userId);

    List<LoginAttempt> findByEmailAndSuccessFalseAndLoginTimeAfter(String email, LocalDateTime after);

    List<LoginAttempt> findByIsUnusualTrueOrderByLoginTimeDesc();

    List<LoginAttempt> findByLoginTimeBetweenOrderByLoginTimeDesc(LocalDateTime start, LocalDateTime end);
}
