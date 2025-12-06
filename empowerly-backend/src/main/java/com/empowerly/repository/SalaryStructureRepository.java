package com.empowerly.repository;

import com.empowerly.model.SalaryStructure;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryStructureRepository extends MongoRepository<SalaryStructure, String> {
    List<SalaryStructure> findByEmployeeId(String employeeId);

    @Query(value = "{ 'employeeId': ?0, 'effectiveFrom': { $lte: ?1 }, $or: [ { 'effectiveTo': null }, { 'effectiveTo': { $gte: ?1 } } ] }", sort = "{ 'effectiveFrom': -1 }")
    Optional<SalaryStructure> findActiveByEmployeeId(String employeeId, LocalDate date);

    @Query(value = "{ 'employeeId': ?0, 'effectiveFrom': { $lte: ?1 }, $or: [ { 'effectiveTo': null }, { 'effectiveTo': { $gte: ?1 } } ] }", sort = "{ 'effectiveFrom': -1 }")
    List<SalaryStructure> findAllActiveByEmployeeId(String employeeId, LocalDate date);
}
