package com.empowerly.controller;

import com.empowerly.dto.*;
import com.empowerly.service.PerformanceReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PerformanceReviewController {

    private final PerformanceReviewService performanceReviewService;

    // ==================== REVIEW CYCLES (HR ONLY) ====================

    @PostMapping("/cycles")
    public ResponseEntity<ReviewCycleResponse> createCycle(
            @RequestBody CreateReviewCycleRequest request,
            Authentication authentication) {
        String hrUserId = authentication.getName();
        ReviewCycleResponse response = performanceReviewService.createCycle(request, hrUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cycles")
    public ResponseEntity<List<ReviewCycleResponse>> getAllCycles() {
        List<ReviewCycleResponse> cycles = performanceReviewService.getAllCycles();
        return ResponseEntity.ok(cycles);
    }

    @PutMapping("/cycles/{id}/publish")
    public ResponseEntity<ReviewCycleResponse> publishCycle(@PathVariable String id) {
        ReviewCycleResponse response = performanceReviewService.publishCycle(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/cycles/{id}/close")
    public ResponseEntity<ReviewCycleResponse> closeCycle(@PathVariable String id) {
        ReviewCycleResponse response = performanceReviewService.closeCycle(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/cycles/{id}/extend")
    public ResponseEntity<ReviewCycleResponse> extendDeadline(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "30") Integer minutes) {
        ReviewCycleResponse response = performanceReviewService.extendDeadline(id, minutes);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/cycles/{id}")
    public ResponseEntity<Void> deleteCycle(@PathVariable String id) {
        performanceReviewService.deleteCycle(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/fix-data")
    public ResponseEntity<String> fixCorruptedData() {
        int fixed = performanceReviewService.fixCorruptedEmployeeIds();
        int deleted = performanceReviewService.removeDuplicateReviews();
        return ResponseEntity.ok("Fixed " + fixed + " corrupted reviews and removed " + deleted + " duplicates");
    }

    // ==================== EMPLOYEE SELF-ASSESSMENT ====================

    @GetMapping("/my-review/{cycleId}")
    public ResponseEntity<PerformanceReviewResponse> getMyReview(
            @PathVariable String cycleId,
            Authentication authentication) {
        String employeeId = authentication.getName();
        PerformanceReviewResponse response = performanceReviewService.getMyReview(employeeId, cycleId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/self-assessment")
    public ResponseEntity<PerformanceReviewResponse> submitSelfAssessment(
            @RequestBody EmployeeSelfAssessmentRequest request,
            Authentication authentication) {
        String employeeId = authentication.getName();
        PerformanceReviewResponse response = performanceReviewService.submitSelfAssessment(request, employeeId);
        return ResponseEntity.ok(response);
    }

    // ==================== HR EVALUATION ====================

    @GetMapping("/cycle/{cycleId}")
    public ResponseEntity<List<PerformanceReviewResponse>> getReviewsByCycle(@PathVariable String cycleId) {
        List<PerformanceReviewResponse> reviews = performanceReviewService.getReviewsByCycle(cycleId);
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/{id}/evaluate")
    public ResponseEntity<PerformanceReviewResponse> evaluateReview(
            @PathVariable String id,
            @RequestBody HRReviewRequest request) {
        PerformanceReviewResponse response = performanceReviewService.evaluateReview(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<PerformanceReviewResponse> approveReview(@PathVariable String id) {
        PerformanceReviewResponse response = performanceReviewService.approveReview(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<PerformanceReviewResponse> rejectReview(@PathVariable String id) {
        PerformanceReviewResponse response = performanceReviewService.rejectReview(id);
        return ResponseEntity.ok(response);
    }

    // ==================== ADMIN ====================

    @GetMapping("/all")
    public ResponseEntity<List<PerformanceReviewResponse>> getAllReviews() {
        List<PerformanceReviewResponse> reviews = performanceReviewService.getAllReviews();
        return ResponseEntity.ok(reviews);
    }
}
