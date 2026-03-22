package com.empowerly.repository;

import com.empowerly.model.Payroll;
import com.empowerly.model.PayrollStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends MongoRepository<Payroll, String> {
    Optional<Payroll> findByMonthAndYear(int month, int year);

    List<Payroll> findByStatus(PayrollStatus status);

    List<Payroll> findByCreatedBy(String userId);

    List<Payroll> findAllByOrderByYearDescMonthDesc();
}
