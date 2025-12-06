package com.empowerly.repository;

import com.empowerly.model.SkillSuggestion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillSuggestionRepository extends MongoRepository<SkillSuggestion, String> {
    List<SkillSuggestion> findByUserIdOrderByGeneratedAtDesc(String userId);

    Optional<SkillSuggestion> findFirstByUserIdAndStatusOrderByGeneratedAtDesc(String userId, String status);
}
