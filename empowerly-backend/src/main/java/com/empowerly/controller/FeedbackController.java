package com.empowerly.controller;

import com.empowerly.dto.FeedbackDTO;
import com.empowerly.dto.ReplyDTO;
import com.empowerly.model.Feedback;
import com.empowerly.model.User;
import com.empowerly.repository.UserRepository;
import com.empowerly.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final UserRepository userRepository;

    /**
     * Submit anonymous feedback (all authenticated users)
     */
    @PostMapping
    public ResponseEntity<Feedback> submitFeedback(@RequestBody FeedbackDTO dto) {
        try {
            Feedback feedback = feedbackService.submitFeedback(dto);
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all feedback (HR and Admin only)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        try {
            List<Feedback> feedback = feedbackService.getAllFeedback();
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get feedback by token (all authenticated users)
     */
    @GetMapping("/token/{token}")
    public ResponseEntity<Feedback> getFeedbackByToken(@PathVariable String token) {
        try {
            Feedback feedback = feedbackService.getFeedbackByToken(token);
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Get public feedback (all authenticated users can view)
     * Only returns feedback that has public replies
     */
    @GetMapping("/public")
    public ResponseEntity<List<Feedback>> getPublicFeedback() {
        try {
            List<Feedback> publicFeedback = feedbackService.getPublicFeedback();
            return ResponseEntity.ok(publicFeedback);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get feedback by status (HR and Admin only)
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<Feedback>> getFeedbackByStatus(@PathVariable String status) {
        try {
            List<Feedback> feedback = feedbackService.getFeedbackByStatus(status);
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Add public reply (HR and Admin only)
     */
    @PostMapping("/{id}/reply/public")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Feedback> addPublicReply(
            @PathVariable String id,
            @RequestBody ReplyDTO dto) {
        try {
            User currentUser = getCurrentUser();
            Feedback feedback = feedbackService.addPublicReply(id, dto, currentUser);
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Add private reply (HR and Admin only)
     */
    @PostMapping("/{id}/reply/private")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Feedback> addPrivateReply(
            @PathVariable String id,
            @RequestBody ReplyDTO dto) {
        try {
            User currentUser = getCurrentUser();
            Feedback feedback = feedbackService.addPrivateReply(id, dto, currentUser);
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update feedback status (HR and Admin only)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Feedback> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            Feedback feedback = feedbackService.updateStatus(id, status);
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get feedback statistics (HR and Admin only)
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<FeedbackService.FeedbackStats> getStatistics() {
        try {
            FeedbackService.FeedbackStats stats = feedbackService.getStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Clear old/hidden feedback (HR and Admin only)
     */
    @DeleteMapping("/clear")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> clearOldFeedback(
            @RequestParam(required = false) String status) {
        try {
            int deletedCount = feedbackService.clearOldFeedback(status);
            return ResponseEntity.ok(Map.of(
                    "message", "Successfully cleared old feedback",
                    "deletedCount", deletedCount));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Helper method to get current user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) authentication.getPrincipal();
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
