package com.empowerly.service;

import com.empowerly.config.GroqConfig;
import com.empowerly.model.TokenUsage;
import com.empowerly.model.User;
import com.empowerly.repository.TokenUsageRepository;
import com.empowerly.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TokenUsageService {

    private static final Logger logger = LoggerFactory.getLogger(TokenUsageService.class);

    @Autowired
    private TokenUsageRepository tokenUsageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroqConfig groqConfig;

    /**
     * Check if user has exceeded their daily limits
     */
    public boolean canMakeRequest(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate today = LocalDate.now();
        List<TokenUsage> todayUsage = tokenUsageRepository.findByUserAndDate(user, today);

        // Check request count
        int requestCount = todayUsage.size();
        if (requestCount >= groqConfig.getUserRequestsPerDay()) {
            logger.warn("User {} exceeded daily request limit: {}/{}",
                    userId, requestCount, groqConfig.getUserRequestsPerDay());
            return false;
        }

        // Check token count
        int totalTokens = todayUsage.stream()
                .mapToInt(TokenUsage::getTotalTokens)
                .sum();

        if (totalTokens >= groqConfig.getUserTokensPerDay()) {
            logger.warn("User {} exceeded daily token limit: {}/{}",
                    userId, totalTokens, groqConfig.getUserTokensPerDay());
            return false;
        }

        return true;
    }

    /**
     * Record token usage after API call
     */
    @Transactional
    public void recordUsage(String userId, int promptTokens, int completionTokens, String feature) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate today = LocalDate.now();
        int totalTokens = promptTokens + completionTokens;

        TokenUsage usage = new TokenUsage(user, today, promptTokens, completionTokens, totalTokens, feature);
        tokenUsageRepository.save(usage);

        logger.info("Recorded token usage for user {}: {} tokens (feature: {})",
                userId, totalTokens, feature);
    }

    /**
     * Get user's current usage stats
     */
    public Map<String, Object> getUserUsageStats(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate today = LocalDate.now();
        List<TokenUsage> todayUsage = tokenUsageRepository.findByUserAndDate(user, today);

        int requestCount = todayUsage.size();
        int totalTokens = todayUsage.stream()
                .mapToInt(TokenUsage::getTotalTokens)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("requestsUsed", requestCount);
        stats.put("requestsLimit", groqConfig.getUserRequestsPerDay());
        stats.put("tokensUsed", totalTokens);
        stats.put("tokensLimit", groqConfig.getUserTokensPerDay());
        stats.put("requestsRemaining", groqConfig.getUserRequestsPerDay() - requestCount);
        stats.put("tokensRemaining", groqConfig.getUserTokensPerDay() - totalTokens);
        stats.put("date", today);

        return stats;
    }

    /**
     * Clean up old token usage records (runs daily at 1 AM IST)
     */
    @Scheduled(cron = "0 0 1 * * ?", zone = "Asia/Kolkata")
    @Transactional
    public void cleanupOldRecords() {
        LocalDate cutoffDate = LocalDate.now().minusDays(30); // Keep 30 days of history
        tokenUsageRepository.deleteByDateBefore(cutoffDate);
        logger.info("Cleaned up token usage records older than {}", cutoffDate);
    }
}
