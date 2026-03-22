package com.empowerly.repository;

import com.empowerly.model.LeaveBalance;
import com.empowerly.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends MongoRepository<LeaveBalance, String> {
    Optional<LeaveBalance> findByUserAndYear(User user, int year);
}
