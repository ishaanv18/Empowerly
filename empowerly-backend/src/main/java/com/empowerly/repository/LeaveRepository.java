package com.empowerly.repository;

import com.empowerly.model.Leave;
import com.empowerly.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRepository extends MongoRepository<Leave, String> {

    List<Leave> findByEmployee(User employee);

    List<Leave> findByEmployeeOrderByCreatedAtDesc(User employee);

    List<Leave> findByStatus(Leave.LeaveStatus status);

    List<Leave> findByStatusOrderByCreatedAtAsc(Leave.LeaveStatus status);

    List<Leave> findByEmployeeDepartmentAndStatus(User.Department department, Leave.LeaveStatus status);
}
