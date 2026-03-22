package com.empowerly.controller;

import com.empowerly.dto.*;
import com.empowerly.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PayrollController {

    private final PayrollService payrollService;

    // ==================== HR ENDPOINTS ====================

    @PostMapping
    public ResponseEntity<PayrollResponse> createPayroll(
            @RequestBody CreatePayrollRequest request,
            Authentication authentication) {
        String hrUserId = authentication.getName();
        PayrollResponse response = payrollService.createPayroll(request, hrUserId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/generate")
    public ResponseEntity<PayrollResponse> generatePayrollEntries(@PathVariable String id) {
        PayrollResponse response = payrollService.generatePayrollEntries(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/entry/{id}")
    public ResponseEntity<PayrollEntryResponse> updatePayrollEntry(
            @PathVariable String id,
            @RequestBody UpdatePayrollEntryRequest request) {
        PayrollEntryResponse response = payrollService.updatePayrollEntry(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<PayrollResponse> submitForApproval(@PathVariable String id) {
        PayrollResponse response = payrollService.submitForApproval(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<PayrollResponse>> getAllPayrolls() {
        List<PayrollResponse> payrolls = payrollService.getAllPayrolls();
        return ResponseEntity.ok(payrolls);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PayrollResponse> getPayrollDetails(@PathVariable String id) {
        PayrollResponse response = payrollService.getPayrollDetails(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/entries")
    public ResponseEntity<List<PayrollEntryResponse>> getPayrollEntries(@PathVariable String id) {
        List<PayrollEntryResponse> entries = payrollService.getPayrollEntries(id);
        return ResponseEntity.ok(entries);
    }

    // ==================== ADMIN ENDPOINTS ====================

    @PostMapping("/{id}/approve")
    public ResponseEntity<PayrollResponse> approvePayroll(
            @PathVariable String id,
            @RequestBody ApprovePayrollRequest request,
            Authentication authentication) {
        String adminId = authentication.getName();
        PayrollResponse response = payrollService.approvePayroll(id, adminId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<PayrollResponse> rejectPayroll(
            @PathVariable String id,
            @RequestBody RejectPayrollRequest request,
            Authentication authentication) {
        String adminId = authentication.getName();
        PayrollResponse response = payrollService.rejectPayroll(id, adminId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayroll(@PathVariable String id) {
        payrollService.deletePayroll(id);
        return ResponseEntity.ok().build();
    }

    // ==================== EMPLOYEE ENDPOINTS ====================

    @GetMapping("/payslips/my")
    public ResponseEntity<List<PayslipResponse>> getMyPayslips(Authentication authentication) {
        String employeeId = authentication.getName();
        List<PayslipResponse> payslips = payrollService.getMyPayslips(employeeId);
        return ResponseEntity.ok(payslips);
    }

    @GetMapping("/payslips/{month}/{year}")
    public ResponseEntity<PayslipResponse> getPayslip(
            @PathVariable int month,
            @PathVariable int year,
            Authentication authentication) {
        String employeeId = authentication.getName();
        PayslipResponse payslip = payrollService.getPayslip(employeeId, month, year);
        return ResponseEntity.ok(payslip);
    }

    // ==================== SALARY STRUCTURE ENDPOINTS ====================

    @PostMapping("/salary-structure")
    public ResponseEntity<String> createSalaryStructure(
            @RequestBody com.empowerly.model.SalaryStructure salaryStructure,
            Authentication authentication) {
        try {
            payrollService.saveSalaryStructure(salaryStructure);
            return ResponseEntity.ok("Salary structure saved successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to save salary structure: " + e.getMessage());
        }
    }

    @GetMapping("/salary-structure/{employeeId}")
    public ResponseEntity<com.empowerly.model.SalaryStructure> getSalaryStructure(@PathVariable String employeeId) {
        com.empowerly.model.SalaryStructure structure = payrollService.getSalaryStructureByEmployee(employeeId);
        if (structure != null) {
            return ResponseEntity.ok(structure);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/salary-structures")
    public ResponseEntity<java.util.List<com.empowerly.model.SalaryStructure>> getAllSalaryStructures() {
        java.util.List<com.empowerly.model.SalaryStructure> structures = payrollService.getAllSalaryStructures();
        return ResponseEntity.ok(structures);
    }
}
