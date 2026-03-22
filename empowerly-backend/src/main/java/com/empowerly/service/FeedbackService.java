package com.empowerly.service;

import com.empowerly.dto.FeedbackDTO;
import com.empowerly.dto.ReplyDTO;
import com.empowerly.model.Feedback;
import com.empowerly.model.FeedbackReply;
import com.empowerly.model.User;
import com.empowerly.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    /**
     * Submit anonymous feedback and generate tracking token
     */
    public Feedback submitFeedback(FeedbackDTO dto) {
        Feedback feedback = new Feedback();
        feedback.setSubject(dto.getSubject());
        feedback.setContent(dto.getContent());
        feedback.setCategory(dto.getCategory() != null ? dto.getCategory() : "OTHER");
        feedback.setStatus("PENDING");
        feedback.setSubmittedAt(LocalDateTime.now());
        feedback.setAnonymousToken(generateUniqueToken());
        feedback.setPublicReplies(new ArrayList<>());

        // Set auto-hide date to 24 hours after submission
        feedback.setIsVisibleToEmployees(true);
        feedback.setAutoHideDate(LocalDateTime.now().plusDays(1));

        return feedbackRepository.save(feedback);
    }

    /**
     * Get all feedback (HR/Admin only)
     */
    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAllByOrderBySubmittedAtDesc();
    }

    /**
     * Get feedback by anonymous token
     */
    public Feedback getFeedbackByToken(String token) {
        return feedbackRepository.findByAnonymousToken(token)
                .orElseThrow(() -> new RuntimeException("Feedback not found with this token"));
    }

    /**
     * Get feedback by status
     */
    public List<Feedback> getFeedbackByStatus(String status) {
        return feedbackRepository.findByStatus(status);
    }

    /**
     * Get feedback by category
     */
    public List<Feedback> getFeedbackByCategory(String category) {
        return feedbackRepository.findByCategory(category);
    }

    /**
     * Get public feedback (only feedback with public replies)
     * Available to all authenticated users
     * Filters out hidden feedback for employees
     */
    public List<Feedback> getPublicFeedback() {
        return feedbackRepository.findAllByOrderBySubmittedAtDesc().stream()
                .filter(f -> f.getPublicReplies() != null && !f.getPublicReplies().isEmpty())
                .filter(f -> f.getIsVisibleToEmployees() != null && f.getIsVisibleToEmployees())
                .toList();
    }

    /**
     * Add public reply (visible to all)
     */
    public Feedback addPublicReply(String feedbackId, ReplyDTO dto, User hrUser) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        FeedbackReply reply = new FeedbackReply();
        reply.setRepliedBy(hrUser.getName());
        reply.setRepliedById(hrUser.getId());
        reply.setContent(dto.getContent());
        reply.setRepliedAt(LocalDateTime.now());
        reply.setIsPublic(true);

        feedback.getPublicReplies().add(reply);

        // Update status to REVIEWED if still PENDING
        if ("PENDING".equals(feedback.getStatus())) {
            feedback.setStatus("REVIEWED");
        }

        return feedbackRepository.save(feedback);
    }

    /**
     * Add private reply (only visible to token holder)
     */
    public Feedback addPrivateReply(String feedbackId, ReplyDTO dto, User hrUser) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        FeedbackReply reply = new FeedbackReply();
        reply.setRepliedBy(hrUser.getName());
        reply.setRepliedById(hrUser.getId());
        reply.setContent(dto.getContent());
        reply.setRepliedAt(LocalDateTime.now());
        reply.setIsPublic(false);

        feedback.setPrivateReply(reply);

        // Update status to REVIEWED if still PENDING
        if ("PENDING".equals(feedback.getStatus())) {
            feedback.setStatus("REVIEWED");
        }

        return feedbackRepository.save(feedback);
    }

    /**
     * Update feedback status
     */
    public Feedback updateStatus(String feedbackId, String status) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        feedback.setStatus(status);
        return feedbackRepository.save(feedback);
    }

    /**
     * Generate unique anonymous token
     */
    private String generateUniqueToken() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }

    /**
     * Get feedback statistics
     */
    public FeedbackStats getStatistics() {
        List<Feedback> allFeedback = feedbackRepository.findAll();

        long pending = allFeedback.stream().filter(f -> "PENDING".equals(f.getStatus())).count();
        long reviewed = allFeedback.stream().filter(f -> "REVIEWED".equals(f.getStatus())).count();
        long resolved = allFeedback.stream().filter(f -> "RESOLVED".equals(f.getStatus())).count();

        return new FeedbackStats(allFeedback.size(), pending, reviewed, resolved);
    }

    /**
     * Clear old feedback (HR/Admin only)
     * Permanently deletes feedback older than 24 hours (based on autoHideDate)
     */
    public int clearOldFeedback(String status) {
        LocalDateTime now = LocalDateTime.now();
        List<Feedback> feedbackToDelete;

        if (status != null && !status.isEmpty()) {
            // Clear only feedback with specific status that is older than 24 hours
            feedbackToDelete = feedbackRepository.findByStatus(status).stream()
                    .filter(f -> f.getAutoHideDate() != null && f.getAutoHideDate().isBefore(now))
                    .toList();
        } else {
            // Clear all feedback older than 24 hours
            feedbackToDelete = feedbackRepository.findAll().stream()
                    .filter(f -> f.getAutoHideDate() != null && f.getAutoHideDate().isBefore(now))
                    .toList();
        }

        int count = feedbackToDelete.size();
        feedbackRepository.deleteAll(feedbackToDelete);
        return count;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class FeedbackStats {
        private long total;
        private long pending;
        private long reviewed;
        private long resolved;
    }
}
