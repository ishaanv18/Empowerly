package com.empowerly.service;

import com.empowerly.dto.*;
import com.empowerly.model.*;
import com.empowerly.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final PayrollEntryRepository payrollEntryRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final PayslipRepository payslipRepository;
    private final UserRepository userRepository;

    // ==================== HR METHODS ====================

    public PayrollResponse createPayroll(CreatePayrollRequest request, String hrUserId) {
        // Check if payroll already exists for this month/year
        Optional<Payroll> existing = payrollRepository.findByMonthAndYear(request.getMonth(), request.getYear());
        if (existing.isPresent()) {
            throw new RuntimeException("Payroll already exists for " + request.getMonth() + "/" + request.getYear());
        }

        Payroll payroll = new Payroll();
        payroll.setMonth(request.getMonth());
        payroll.setYear(request.getYear());
        payroll.setStatus(PayrollStatus.DRAFT);
        payroll.setCreatedBy(hrUserId);
        payroll.setHrNotes(request.getHrNotes());
        payroll.setGeneratedAt(LocalDateTime.now());
        payroll.setTotalEmployees(0);
        payroll.setTotalAmount(0.0);

        payroll = payrollRepository.save(payroll);
        return convertToPayrollResponse(payroll);
    }

    public PayrollResponse generatePayrollEntries(String payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));

        if (payroll.getStatus() != PayrollStatus.DRAFT) {
            throw new RuntimeException("Can only generate entries for DRAFT payroll");
        }

        // Get all users in the database
        List<User> employees = userRepository.findAll();

        int totalEmployees = 0;
        double totalAmount = 0.0;

        for (User employee : employees) {
            // Get salary structure - use findAllActiveByEmployeeId to handle duplicates
            List<SalaryStructure> salaryStructures = salaryStructureRepository
                    .findAllActiveByEmployeeId(employee.getId(), LocalDate.now());

            if (salaryStructures.isEmpty()) {
                continue; // Skip users without salary structure
            }

            // Take the first one (most recent due to sort order)
            SalaryStructure structure = salaryStructures.get(0);

            // Get attendance data
            int workingDays = getWorkingDaysInMonth(payroll.getMonth(), payroll.getYear());
            int presentDays = getPresentDays(employee.getId(), payroll.getMonth(), payroll.getYear());
            int paidLeaves = getPaidLeaves(employee.getId(), payroll.getMonth(), payroll.getYear());
            int unpaidLeaves = getUnpaidLeaves(employee.getId(), payroll.getMonth(), payroll.getYear());

            // Create payroll entry
            PayrollEntry entry = new PayrollEntry();
            entry.setPayrollId(payrollId);
            entry.setEmployeeId(employee.getId());
            entry.setEmployeeName(employee.getName());
            entry.setBasicSalary(structure.getBasicSalary());

            // Set allowances
            Map<String, Double> allowances = new HashMap<>();
            allowances.put("HRA", structure.getHra());
            allowances.put("DA", structure.getDa());
            allowances.put("Travel", structure.getTravelAllowance());
            allowances.put("Medical", structure.getMedicalAllowance());
            if (structure.getOtherAllowances() > 0) {
                allowances.put("Other", structure.getOtherAllowances());
            }
            entry.setAllowances(allowances);

            // Set attendance
            entry.setWorkingDays(workingDays);
            entry.setPresentDays(presentDays);
            entry.setPaidLeaves(paidLeaves);
            entry.setUnpaidLeaves(unpaidLeaves);
            entry.setOvertimeHours(0.0);
            entry.setPenalties(0.0);

            // Calculate salary
            calculateSalary(entry, structure);

            entry.setStatus(PayrollEntryStatus.GENERATED);
            payrollEntryRepository.save(entry);

            totalEmployees++;
            totalAmount += entry.getNetSalary();
        }

        // Update payroll
        payroll.setTotalEmployees(totalEmployees);
        payroll.setTotalAmount(totalAmount);
        payroll = payrollRepository.save(payroll);

        return convertToPayrollResponse(payroll);
    }

    public PayrollEntryResponse updatePayrollEntry(String entryId, UpdatePayrollEntryRequest request) {
        PayrollEntry entry = payrollEntryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Payroll entry not found"));

        // Update values
        entry.setBasicSalary(request.getBasicSalary());
        entry.setAllowances(request.getAllowances());
        entry.setWorkingDays(request.getWorkingDays());
        entry.setPresentDays(request.getPresentDays());
        entry.setPaidLeaves(request.getPaidLeaves());
        entry.setUnpaidLeaves(request.getUnpaidLeaves());
        entry.setOvertimeHours(request.getOvertimeHours());
        entry.setPenalties(request.getPenalties());
        entry.setNotes(request.getNotes());

        // Get salary structure for tax/PF percentages
        SalaryStructure structure = salaryStructureRepository
                .findActiveByEmployeeId(entry.getEmployeeId(), LocalDate.now())
                .orElseThrow(() -> new RuntimeException("Salary structure not found"));

        // Recalculate salary
        calculateSalary(entry, structure);

        entry = payrollEntryRepository.save(entry);
        return convertToPayrollEntryResponse(entry);
    }

    public PayrollResponse submitForApproval(String payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));

        if (payroll.getStatus() != PayrollStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT payroll can be submitted");
        }

        payroll.setStatus(PayrollStatus.PENDING_APPROVAL);
        payroll.setSubmittedAt(LocalDateTime.now());
        payroll = payrollRepository.save(payroll);

        return convertToPayrollResponse(payroll);
    }

    public List<PayrollResponse> getAllPayrolls() {
        return payrollRepository.findAllByOrderByYearDescMonthDesc().stream()
                .map(this::convertToPayrollResponse)
                .collect(Collectors.toList());
    }

    public PayrollResponse getPayrollDetails(String payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));
        return convertToPayrollResponse(payroll);
    }

    public List<PayrollEntryResponse> getPayrollEntries(String payrollId) {
        return payrollEntryRepository.findByPayrollId(payrollId).stream()
                .map(this::convertToPayrollEntryResponse)
                .collect(Collectors.toList());
    }

    // ==================== ADMIN METHODS ====================

    public PayrollResponse approvePayroll(String payrollId, String adminId, ApprovePayrollRequest request) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));

        if (payroll.getStatus() != PayrollStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Only PENDING payroll can be approved");
        }

        payroll.setStatus(PayrollStatus.APPROVED);
        payroll.setApprovedBy(adminId);
        payroll.setAdminNotes(request.getAdminNotes());
        payroll.setApprovedAt(LocalDateTime.now());
        payroll = payrollRepository.save(payroll);

        // Generate payslips for all entries
        generatePayslips(payrollId);

        // Update entry statuses
        List<PayrollEntry> entries = payrollEntryRepository.findByPayrollId(payrollId);
        entries.forEach(entry -> {
            entry.setStatus(PayrollEntryStatus.APPROVED);
            payrollEntryRepository.save(entry);
        });

        return convertToPayrollResponse(payroll);
    }

    public PayrollResponse rejectPayroll(String payrollId, String adminId, RejectPayrollRequest request) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));

        if (payroll.getStatus() != PayrollStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Only PENDING payroll can be rejected");
        }

        payroll.setStatus(PayrollStatus.REJECTED);
        payroll.setApprovedBy(adminId);
        payroll.setRejectionReason(request.getRejectionReason());
        payroll.setRejectedAt(LocalDateTime.now());
        payroll = payrollRepository.save(payroll);

        return convertToPayrollResponse(payroll);
    }

    public void deletePayroll(String payrollId) {
        // Check if payroll exists
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));

        // Delete all payslips associated with this payroll's month and year
        List<PayrollEntry> entries = payrollEntryRepository.findByPayrollId(payrollId);
        for (PayrollEntry entry : entries) {
            // Delete all payslips for this employee, month, and year (handles duplicates)
            List<Payslip> payslips = payslipRepository.findAllByEmployeeIdAndMonthAndYear(
                    entry.getEmployeeId(),
                    payroll.getMonth(),
                    payroll.getYear());
            if (!payslips.isEmpty()) {
                payslipRepository.deleteAll(payslips);
            }
        }

        // Delete all payroll entries
        payrollEntryRepository.deleteAll(entries);

        // Delete the payroll itself
        payrollRepository.delete(payroll);
    }

    // ==================== EMPLOYEE METHODS ====================

    public List<PayslipResponse> getMyPayslips(String employeeId) {
        return payslipRepository.findByEmployeeIdOrderByYearDescMonthDesc(employeeId).stream()
                .map(this::convertToPayslipResponse)
                .collect(Collectors.toList());
    }

    public PayslipResponse getPayslip(String employeeId, int month, int year) {
        Payslip payslip = payslipRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year)
                .orElseThrow(() -> new RuntimeException("Payslip not found"));
        return convertToPayslipResponse(payslip);
    }

    public void saveSalaryStructure(SalaryStructure salaryStructure) {
        salaryStructure.setCreatedAt(LocalDateTime.now());
        salaryStructure.setUpdatedAt(LocalDateTime.now());
        salaryStructureRepository.save(salaryStructure);
    }

    public SalaryStructure getSalaryStructureByEmployee(String employeeId) {
        return salaryStructureRepository.findActiveByEmployeeId(employeeId, LocalDate.now())
                .orElse(null);
    }

    public List<SalaryStructure> getAllSalaryStructures() {
        return salaryStructureRepository.findAll();
    }

    // ==================== CALCULATION ENGINE ====================

    private void calculateSalary(PayrollEntry entry, SalaryStructure structure) {
        // Calculate gross salary
        double grossSalary = entry.getBasicSalary();
        for (Double allowance : entry.getAllowances().values()) {
            grossSalary += allowance;
        }
        entry.setGrossSalary(grossSalary);

        // Calculate deductions
        Map<String, Double> deductions = new HashMap<>();

        // Tax deduction
        double tax = grossSalary * (structure.getTaxPercentage() / 100);
        deductions.put("Tax", tax);

        // PF deduction
        double pf = entry.getBasicSalary() * (structure.getPfPercentage() / 100);
        deductions.put("PF", pf);

        // Unpaid leave deduction
        if (entry.getUnpaidLeaves() > 0) {
            double unpaidLeaveDeduction = (entry.getBasicSalary() / entry.getWorkingDays()) * entry.getUnpaidLeaves();
            deductions.put("UnpaidLeave", unpaidLeaveDeduction);
        }

        // Penalties
        if (entry.getPenalties() > 0) {
            deductions.put("Penalties", entry.getPenalties());
        }

        entry.setDeductions(deductions);

        // Calculate net salary
        double totalDeductions = deductions.values().stream().mapToDouble(Double::doubleValue).sum();
        double netSalary = grossSalary - totalDeductions;
        entry.setNetSalary(netSalary);
    }

    private void generatePayslips(String payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId).orElseThrow();
        List<PayrollEntry> entries = payrollEntryRepository.findByPayrollId(payrollId);

        for (PayrollEntry entry : entries) {
            Payslip payslip = new Payslip();
            payslip.setPayrollEntryId(entry.getId());
            payslip.setEmployeeId(entry.getEmployeeId());
            payslip.setEmployeeName(entry.getEmployeeName());
            payslip.setMonth(payroll.getMonth());
            payslip.setYear(payroll.getYear());
            payslip.setBasicSalary(entry.getBasicSalary());
            payslip.setAllowances(entry.getAllowances());
            payslip.setDeductions(entry.getDeductions());
            payslip.setGrossSalary(entry.getGrossSalary());
            payslip.setNetSalary(entry.getNetSalary());
            payslip.setWorkingDays(entry.getWorkingDays());
            payslip.setPresentDays(entry.getPresentDays());
            payslip.setPaidLeaves(entry.getPaidLeaves());
            payslip.setUnpaidLeaves(entry.getUnpaidLeaves());
            payslip.setOvertimeHours(entry.getOvertimeHours());
            payslip.setGeneratedAt(LocalDateTime.now());

            payslipRepository.save(payslip);
        }
    }

    // ==================== HELPER METHODS ====================

    private int getWorkingDaysInMonth(int month, int year) {
        // Simplified: assume 22 working days per month
        return 22;
    }

    private int getPresentDays(String employeeId, int month, int year) {
        // Get from attendance repository
        // Simplified implementation
        return 20;
    }

    private int getPaidLeaves(String employeeId, int month, int year) {
        // Get from leave repository
        return 1;
    }

    private int getUnpaidLeaves(String employeeId, int month, int year) {
        // Get from leave repository
        return 0;
    }

    private PayrollResponse convertToPayrollResponse(Payroll payroll) {
        PayrollResponse response = new PayrollResponse();
        response.setId(payroll.getId());
        response.setMonth(payroll.getMonth());
        response.setYear(payroll.getYear());
        response.setStatus(payroll.getStatus());
        response.setCreatedBy(payroll.getCreatedBy());
        response.setApprovedBy(payroll.getApprovedBy());
        response.setTotalEmployees(payroll.getTotalEmployees());
        response.setTotalAmount(payroll.getTotalAmount());
        response.setGeneratedAt(payroll.getGeneratedAt());
        response.setSubmittedAt(payroll.getSubmittedAt());
        response.setApprovedAt(payroll.getApprovedAt());
        response.setRejectedAt(payroll.getRejectedAt());
        response.setHrNotes(payroll.getHrNotes());
        response.setAdminNotes(payroll.getAdminNotes());
        response.setRejectionReason(payroll.getRejectionReason());

        // Get user names
        if (payroll.getCreatedBy() != null) {
            userRepository.findById(payroll.getCreatedBy())
                    .ifPresent(user -> response.setCreatedByName(user.getName()));
        }
        if (payroll.getApprovedBy() != null) {
            userRepository.findById(payroll.getApprovedBy())
                    .ifPresent(user -> response.setApprovedByName(user.getName()));
        }

        return response;
    }

    private PayrollEntryResponse convertToPayrollEntryResponse(PayrollEntry entry) {
        PayrollEntryResponse response = new PayrollEntryResponse();
        response.setId(entry.getId());
        response.setPayrollId(entry.getPayrollId());
        response.setEmployeeId(entry.getEmployeeId());
        response.setEmployeeName(entry.getEmployeeName());
        response.setBasicSalary(entry.getBasicSalary());
        response.setAllowances(entry.getAllowances());
        response.setDeductions(entry.getDeductions());
        response.setGrossSalary(entry.getGrossSalary());
        response.setNetSalary(entry.getNetSalary());
        response.setWorkingDays(entry.getWorkingDays());
        response.setPresentDays(entry.getPresentDays());
        response.setPaidLeaves(entry.getPaidLeaves());
        response.setUnpaidLeaves(entry.getUnpaidLeaves());
        response.setOvertimeHours(entry.getOvertimeHours());
        response.setPenalties(entry.getPenalties());
        response.setNotes(entry.getNotes());
        response.setStatus(entry.getStatus());
        return response;
    }

    private PayslipResponse convertToPayslipResponse(Payslip payslip) {
        PayslipResponse response = new PayslipResponse();
        response.setId(payslip.getId());
        response.setEmployeeId(payslip.getEmployeeId());
        response.setEmployeeName(payslip.getEmployeeName());
        response.setMonth(payslip.getMonth());
        response.setYear(payslip.getYear());
        response.setBasicSalary(payslip.getBasicSalary());
        response.setAllowances(payslip.getAllowances());
        response.setDeductions(payslip.getDeductions());
        response.setGrossSalary(payslip.getGrossSalary());
        response.setNetSalary(payslip.getNetSalary());
        response.setWorkingDays(payslip.getWorkingDays());
        response.setPresentDays(payslip.getPresentDays());
        response.setPaidLeaves(payslip.getPaidLeaves());
        response.setUnpaidLeaves(payslip.getUnpaidLeaves());
        response.setOvertimeHours(payslip.getOvertimeHours());
        response.setGeneratedAt(payslip.getGeneratedAt());
        response.setPdfUrl(payslip.getPdfUrl());
        return response;
    }
}
