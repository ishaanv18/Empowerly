package com.empowerly.repository;

import com.empowerly.model.ContactMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContactMessageRepository extends MongoRepository<ContactMessage, String> {
    List<ContactMessage> findByEmailSentFalse();

    List<ContactMessage> findBySubmittedAtAfter(LocalDateTime dateTime);

    List<ContactMessage> findAllByOrderBySubmittedAtDesc();
}
