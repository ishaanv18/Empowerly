package com.empowerly.repository;

import com.empowerly.model.TokenUsage;
import com.empowerly.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TokenUsageRepository extends MongoRepository<TokenUsage, String> {

    List<TokenUsage> findByUserAndDate(User user, LocalDate date);

    @Query("{ 'user': ?0, 'date': ?1 }")
    List<TokenUsage> findByUserAndDateQuery(User user, LocalDate date);

    // Get all usage for a user on a specific date
    List<TokenUsage> findByUser_IdAndDate(String userId, LocalDate date);

    // Delete old records (for cleanup)
    void deleteByDateBefore(LocalDate date);
}
