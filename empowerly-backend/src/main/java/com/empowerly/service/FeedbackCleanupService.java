package com.empowerly.service;

import com.empowerly.model.Feedback;
import com.empowerly.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackCleanupService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    /**
     * Scheduled task to hide old feedback from employees
     * Runs daily at 12:01 AM
     */
    @Scheduled(cron = "0 1 0 * * *")
    public void hideOldFeedback() {
        LocalDateTime now = LocalDateTime.now();

        // Find all feedback where autoHideDate has passed and still visible to
        // employees
        List<Feedback> feedbackToHide = feedbackRepository.findAll().stream()
                .filter(f -> f.getAutoHideDate() != null
                        && f.getAutoHideDate().isBefore(now)
                        && f.getIsVisibleToEmployees() != null
                        && f.getIsVisibleToEmployees())
                .toList();

        // Hide feedback from employees
        for (Feedback feedback : feedbackToHide) {
            feedback.setIsVisibleToEmployees(false);
            feedback.setHiddenAt(now);
        }

        if (!feedbackToHide.isEmpty()) {
            feedbackRepository.saveAll(feedbackToHide);
            System.out.println("Auto-hidden " + feedbackToHide.size() + " feedback items from employees");
        }
    }

    /**
     * Manual method to hide old feedback (can be called on-demand)
     */
    public int hideOldFeedbackManually() {
        LocalDateTime now = LocalDateTime.now();

        List<Feedback> feedbackToHide = feedbackRepository.findAll().stream()
                .filter(f -> f.getAutoHideDate() != null
                        && f.getAutoHideDate().isBefore(now)
                        && f.getIsVisibleToEmployees() != null
                        && f.getIsVisibleToEmployees())
                .toList();

        for (Feedback feedback : feedbackToHide) {
            feedback.setIsVisibleToEmployees(false);
            feedback.setHiddenAt(now);
        }

        if (!feedbackToHide.isEmpty()) {
            feedbackRepository.saveAll(feedbackToHide);
        }

        return feedbackToHide.size();
    }
}
