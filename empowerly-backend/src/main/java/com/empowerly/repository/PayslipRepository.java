package com.empowerly.repository;

import com.empowerly.model.Payslip;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayslipRepository extends MongoRepository<Payslip, String> {
    List<Payslip> findByEmployeeIdOrderByYearDescMonthDesc(String employeeId);

    Optional<Payslip> findByEmployeeIdAndMonthAndYear(String employeeId, int month, int year);

    List<Payslip> findAllByEmployeeIdAndMonthAndYear(String employeeId, int month, int year);

    Optional<Payslip> findByPayrollEntryId(String payrollEntryId);
}
