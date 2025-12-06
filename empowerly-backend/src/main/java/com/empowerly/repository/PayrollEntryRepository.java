package com.empowerly.repository;

import com.empowerly.model.PayrollEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollEntryRepository extends MongoRepository<PayrollEntry, String> {
    List<PayrollEntry> findByPayrollId(String payrollId);

    List<PayrollEntry> findByEmployeeId(String employeeId);

    Optional<PayrollEntry> findByPayrollIdAndEmployeeId(String payrollId, String employeeId);
}
