package com.empowerly.repository;

import com.empowerly.model.Attendance;
import com.empowerly.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {

    List<Attendance> findByUser(User user);

    List<Attendance> findByUserOrderByCheckInTimeDesc(User user);

    Optional<Attendance> findByUserAndStatus(User user, String status);

    List<Attendance> findByUserAndCheckInTimeBetween(User user, LocalDateTime start, LocalDateTime end);

    List<Attendance> findByCheckInTimeBetween(LocalDateTime start, LocalDateTime end);

    List<Attendance> findByStatus(String status);
}
