package com.empowerly.repository;

import com.empowerly.model.SecurityAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityAlertRepository extends MongoRepository<SecurityAlert, String> {
    List<SecurityAlert> findByStatusOrderByDetectedAtDesc(String status);

    List<SecurityAlert> findByUserIdOrderByDetectedAtDesc(String userId);

    List<SecurityAlert> findBySeverityOrderByDetectedAtDesc(String severity);

    List<SecurityAlert> findByStatusAndSeverityOrderByDetectedAtDesc(String status, String severity);
}
