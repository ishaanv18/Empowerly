package com.empowerly.service;

import com.empowerly.dto.*;
import com.empowerly.model.PerformanceReview;
import com.empowerly.model.ReviewCycle;
import com.empowerly.model.User;
import com.empowerly.repository.PerformanceReviewRepository;
import com.empowerly.repository.ReviewCycleRepository;
import com.empowerly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PerformanceReviewService {

    private final ReviewCycleRepository reviewCycleRepository;
    private final PerformanceReviewRepository performanceReviewRepository;
    private final UserRepository userRepository;

    // ==================== CYCLE MANAGEMENT (HR ONLY) ====================

    public ReviewCycleResponse createCycle(CreateReviewCycleRequest request, String hrUserId) {
        ReviewCycle cycle = new ReviewCycle(
                request.getName(),
                request.getStartDate(),
                request.getEndDate(),
                hrUserId);
        cycle = reviewCycleRepository.save(cycle);

        // Create pending reviews for all users (EMPLOYEE, HR, ADMIN)
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            PerformanceReview review = new PerformanceReview();
            review.setEmployeeId(user.getId());
            review.setCycleId(cycle.getId());
            review.setStatus(PerformanceReview.ReviewStatus.PENDING);
            review.setCreatedAt(LocalDateTime.now());
            performanceReviewRepository.save(review);
        }

        return convertCycleToResponse(cycle);
    }

    public List<ReviewCycleResponse> getAllCycles() {
        return reviewCycleRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertCycleToResponse)
                .collect(Collectors.toList());
    }

    public ReviewCycleResponse publishCycle(String cycleId) {
        ReviewCycle cycle = reviewCycleRepository.findById(cycleId)
                .orElseThrow(() -> new RuntimeException("Cycle not found"));
        cycle.setStatus(ReviewCycle.CycleStatus.ACTIVE);
        cycle = reviewCycleRepository.save(cycle);
        return convertCycleToResponse(cycle);
    }

    public ReviewCycleResponse closeCycle(String cycleId) {
        ReviewCycle cycle = reviewCycleRepository.findById(cycleId)
                .orElseThrow(() -> new RuntimeException("Cycle not found"));
        cycle.setStatus(ReviewCycle.CycleStatus.CLOSED);
        cycle = reviewCycleRepository.save(cycle);
        return convertCycleToResponse(cycle);
    }

    public ReviewCycleResponse extendDeadline(String cycleId, Integer minutes) {
        ReviewCycle cycle = reviewCycleRepository.findById(cycleId)
                .orElseThrow(() -> new RuntimeException("Cycle not found"));

        // Default to 30 minutes if not specified
        int extensionMinutes = (minutes != null && minutes > 0) ? minutes : 30;

        // Extend the end date by the specified minutes
        cycle.setEndDate(cycle.getEndDate().plusMinutes(extensionMinutes));
        cycle = reviewCycleRepository.save(cycle);

        return convertCycleToResponse(cycle);
    }

    public void deleteCycle(String cycleId) {
        // Check if cycle exists
        ReviewCycle cycle = reviewCycleRepository.findById(cycleId)
                .orElseThrow(() -> new RuntimeException("Cycle not found"));

        // Delete all reviews associated with this cycle
        List<PerformanceReview> reviews = performanceReviewRepository.findByCycleId(cycleId);
        performanceReviewRepository.deleteAll(reviews);

        // Delete the cycle
        reviewCycleRepository.delete(cycle);
    }

    public int fixCorruptedEmployeeIds() {
        List<PerformanceReview> allReviews = performanceReviewRepository.findAll();
        int fixedCount = 0;

        for (PerformanceReview review : allReviews) {
            String employeeId = review.getEmployeeId();

            // Check if employeeId contains "User(" which indicates it's corrupted
            if (employeeId != null && employeeId.contains("User(")) {
                // Extract the actual ID from the User object string
                // Format: "User(id=69329ca691fb131be0bd7b40, name=..."
                int idStart = employeeId.indexOf("id=") + 3;
                int idEnd = employeeId.indexOf(",", idStart);

                if (idStart > 2 && idEnd > idStart) {
                    String actualId = employeeId.substring(idStart, idEnd);
                    review.setEmployeeId(actualId);
                    performanceReviewRepository.save(review);
                    fixedCount++;
                }
            }
        }

        return fixedCount;
    }

    public int removeDuplicateReviews() {
        List<PerformanceReview> allReviews = performanceReviewRepository.findAll();
        Map<String, List<PerformanceReview>> reviewsByEmployeeAndCycle = new HashMap<>();

        // Group reviews by employeeId + cycleId
        for (PerformanceReview review : allReviews) {
            String key = review.getEmployeeId() + "_" + review.getCycleId();
            reviewsByEmployeeAndCycle.computeIfAbsent(key, k -> new ArrayList<>()).add(review);
        }

        int deletedCount = 0;

        // For each group, keep only the best review and delete the rest
        for (List<PerformanceReview> reviews : reviewsByEmployeeAndCycle.values()) {
            if (reviews.size() > 1) {
                // Sort by priority: SUBMITTED > REVIEWED > APPROVED > PENDING
                reviews.sort((r1, r2) -> {
                    int priority1 = getStatusPriority(r1.getStatus());
                    int priority2 = getStatusPriority(r2.getStatus());
                    return Integer.compare(priority2, priority1); // Higher priority first
                });

                // Keep the first one (highest priority), delete the rest
                for (int i = 1; i < reviews.size(); i++) {
                    performanceReviewRepository.delete(reviews.get(i));
                    deletedCount++;
                }
            }
        }

        return deletedCount;
    }

    private int getStatusPriority(PerformanceReview.ReviewStatus status) {
        switch (status) {
            case APPROVED:
                return 5;
            case REVIEWED:
                return 4;
            case SUBMITTED:
                return 3;
            case REJECTED:
                return 2;
            case PENDING:
                return 1;
            default:
                return 0;
        }
    }

    // ==================== EMPLOYEE SELF-ASSESSMENT ====================

    public PerformanceReviewResponse submitSelfAssessment(EmployeeSelfAssessmentRequest request, String employeeId) {
        // Check if the cycle is still active and within deadline
        ReviewCycle cycle = reviewCycleRepository.findById(request.getCycleId())
                .orElseThrow(() -> new RuntimeException("Review cycle not found"));

        if (cycle.getStatus() != ReviewCycle.CycleStatus.ACTIVE) {
            throw new RuntimeException("This review cycle is not active. Cannot submit reviews.");
        }

        if (LocalDateTime.now().isAfter(cycle.getEndDate())) {
            throw new RuntimeException(
                    "The deadline for this review cycle has passed. You can no longer submit your review.");
        }

        // Find existing review or create new one
        PerformanceReview review = performanceReviewRepository
                .findByEmployeeIdAndCycleId(employeeId, request.getCycleId())
                .orElseGet(() -> {
                    // Create new review if it doesn't exist
                    PerformanceReview newReview = new PerformanceReview();
                    newReview.setEmployeeId(employeeId);
                    newReview.setCycleId(request.getCycleId());
                    newReview.setStatus(PerformanceReview.ReviewStatus.PENDING);
                    newReview.setCreatedAt(LocalDateTime.now());
                    return newReview;
                });

        if (review.getStatus() != PerformanceReview.ReviewStatus.PENDING) {
            throw new RuntimeException("Review already submitted");
        }

        review.setEmployeeRatings(request.getRatings());
        review.setEmployeeComment(request.getComment());
        review.setAchievements(request.getAchievements());
        review.setChallenges(request.getChallenges());
        review.setGoals(request.getGoals());
        review.setStatus(PerformanceReview.ReviewStatus.SUBMITTED);
        review.setSubmittedAt(LocalDateTime.now());

        review = performanceReviewRepository.save(review);
        return convertReviewToResponse(review);
    }

    public PerformanceReviewResponse getMyReview(String employeeId, String cycleId) {
        return performanceReviewRepository
                .findByEmployeeIdAndCycleId(employeeId, cycleId)
                .map(this::convertReviewToResponse)
                .orElse(null);
    }

    // ==================== HR EVALUATION ====================

    public List<PerformanceReviewResponse> getReviewsByCycle(String cycleId) {
        return performanceReviewRepository.findByCycleId(cycleId)
                .stream()
                .map(this::convertReviewToResponse)
                .collect(Collectors.toList());
    }

    public PerformanceReviewResponse evaluateReview(String reviewId, HRReviewRequest request) {
        PerformanceReview review = performanceReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // Allow HR to evaluate both SUBMITTED and PENDING reviews
        // If PENDING (user hasn't submitted), employee ratings will be null/empty

        // If employee hasn't submitted, initialize empty ratings (will be treated as
        // zeros)
        if (review.getEmployeeRatings() == null || review.getEmployeeRatings().isEmpty()) {
            // Create empty map for employee ratings (defaults to 0)
            review.setEmployeeRatings(new java.util.HashMap<>());
        }

        review.setHrRatings(request.getHrRatings());
        review.setHrComment(request.getHrComment());
        review.setStatus(PerformanceReview.ReviewStatus.REVIEWED);
        review.setReviewedAt(LocalDateTime.now());

        // Calculate final score (employee ratings will be 0 if not submitted)
        review.setFinalScore(calculateFinalScore(review.getEmployeeRatings(), review.getHrRatings()));

        review = performanceReviewRepository.save(review);
        return convertReviewToResponse(review);
    }

    public PerformanceReviewResponse approveReview(String reviewId) {
        PerformanceReview review = performanceReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (review.getStatus() != PerformanceReview.ReviewStatus.REVIEWED) {
            throw new RuntimeException("Review not evaluated yet");
        }

        review.setStatus(PerformanceReview.ReviewStatus.APPROVED);
        review = performanceReviewRepository.save(review);
        return convertReviewToResponse(review);
    }

    public PerformanceReviewResponse rejectReview(String reviewId) {
        PerformanceReview review = performanceReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setStatus(PerformanceReview.ReviewStatus.REJECTED);
        review = performanceReviewRepository.save(review);
        return convertReviewToResponse(review);
    }

    // ==================== ADMIN ====================

    public List<PerformanceReviewResponse> getAllReviews() {
        return performanceReviewRepository.findAll()
                .stream()
                .map(this::convertReviewToResponse)
                .collect(Collectors.toList());
    }

    // ==================== HELPER METHODS ====================

    private Double calculateFinalScore(Map<String, Integer> employeeRatings, Map<String, Integer> hrRatings) {
        if (employeeRatings == null || hrRatings == null) {
            return null;
        }

        // Calculate average of employee ratings
        double employeeAvg = employeeRatings.values().stream()
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);

        // Calculate average of HR ratings
        double hrAvg = hrRatings.values().stream()
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);

        // Weighted formula: 40% employee, 60% HR
        return (employeeAvg * 0.4) + (hrAvg * 0.6);
    }

    private ReviewCycleResponse convertCycleToResponse(ReviewCycle cycle) {
        ReviewCycleResponse response = new ReviewCycleResponse();
        response.setId(cycle.getId());
        response.setName(cycle.getName());
        response.setStartDate(cycle.getStartDate());
        response.setEndDate(cycle.getEndDate());
        response.setStatus(cycle.getStatus().toString());
        response.setCreatedBy(cycle.getCreatedBy());
        response.setCreatedAt(cycle.getCreatedAt());

        // Get creator name
        userRepository.findById(cycle.getCreatedBy()).ifPresent(user -> response.setCreatedByName(user.getName()));

        // Get statistics
        response.setTotalReviews(performanceReviewRepository.countByCycleId(cycle.getId()).intValue());
        response.setSubmittedReviews(performanceReviewRepository
                .countByCycleIdAndStatus(cycle.getId(), PerformanceReview.ReviewStatus.SUBMITTED).intValue());
        response.setApprovedReviews(performanceReviewRepository
                .countByCycleIdAndStatus(cycle.getId(), PerformanceReview.ReviewStatus.APPROVED).intValue());

        return response;
    }

    private PerformanceReviewResponse convertReviewToResponse(PerformanceReview review) {
        PerformanceReviewResponse response = new PerformanceReviewResponse();
        response.setId(review.getId());
        response.setEmployeeId(review.getEmployeeId());
        response.setCycleId(review.getCycleId());
        response.setEmployeeRatings(review.getEmployeeRatings());
        response.setEmployeeComment(review.getEmployeeComment());
        response.setAchievements(review.getAchievements());
        response.setChallenges(review.getChallenges());
        response.setGoals(review.getGoals());
        response.setHrRatings(review.getHrRatings());
        response.setHrComment(review.getHrComment());
        response.setFinalScore(review.getFinalScore());
        response.setStatus(review.getStatus().toString());
        response.setSubmittedAt(review.getSubmittedAt());
        response.setReviewedAt(review.getReviewedAt());
        response.setCreatedAt(review.getCreatedAt());

        // Get employee name with fallback
        userRepository.findById(review.getEmployeeId()).ifPresentOrElse(
                user -> response.setEmployeeName(user.getName()),
                () -> response.setEmployeeName("Unknown Employee (ID: " + review.getEmployeeId() + ")"));

        // Get cycle name
        reviewCycleRepository.findById(review.getCycleId()).ifPresent(cycle -> response.setCycleName(cycle.getName()));

        return response;
    }
}
