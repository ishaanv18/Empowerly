package com.empowerly.repository;

import com.empowerly.model.Feedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, String> {
    List<Feedback> findAllByOrderBySubmittedAtDesc();

    Optional<Feedback> findByAnonymousToken(String token);

    List<Feedback> findByStatus(String status);

    List<Feedback> findByCategory(String category);
}
