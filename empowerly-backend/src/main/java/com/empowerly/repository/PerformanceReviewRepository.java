package com.empowerly.repository;

import com.empowerly.model.PerformanceReview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceReviewRepository extends MongoRepository<PerformanceReview, String> {

    Optional<PerformanceReview> findByEmployeeIdAndCycleId(String employeeId, String cycleId);

    List<PerformanceReview> findByCycleId(String cycleId);

    List<PerformanceReview> findByEmployeeId(String employeeId);

    List<PerformanceReview> findByCycleIdAndStatus(String cycleId, PerformanceReview.ReviewStatus status);

    Long countByCycleId(String cycleId);

    Long countByCycleIdAndStatus(String cycleId, PerformanceReview.ReviewStatus status);
}
