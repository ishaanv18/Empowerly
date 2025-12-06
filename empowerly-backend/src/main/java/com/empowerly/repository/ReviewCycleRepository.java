package com.empowerly.repository;

import com.empowerly.model.ReviewCycle;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewCycleRepository extends MongoRepository<ReviewCycle, String> {

    List<ReviewCycle> findByCreatedBy(String createdBy);

    List<ReviewCycle> findByStatus(ReviewCycle.CycleStatus status);

    List<ReviewCycle> findAllByOrderByCreatedAtDesc();
}
