package com.empowerly.repository;

import com.empowerly.model.MotivationPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MotivationPostRepository extends MongoRepository<MotivationPost, String> {
    List<MotivationPost> findAllByOrderByCreatedAtDesc();

    List<MotivationPost> findByCategoryOrderByCreatedAtDesc(String category);

    List<MotivationPost> findByAuthorIdOrderByCreatedAtDesc(String authorId);
}
