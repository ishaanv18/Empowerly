package com.empowerly.controller;

import com.empowerly.model.SkillSuggestion;
import com.empowerly.service.SkillDevelopmentService;
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
@RequestMapping("/api/skills")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SkillDevelopmentController {

    private final SkillDevelopmentService skillDevelopmentService;

    /**
     * Generate personalized skill suggestions using AI
     */
    @PostMapping("/generate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SkillSuggestion> generateSkillSuggestions() {
        try {
            String userId = getCurrentUserId();
            SkillSuggestion suggestion = skillDevelopmentService.generateSkillSuggestions(userId);
            return ResponseEntity.ok(suggestion);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get my skill suggestions
     */
    @GetMapping("/my-suggestions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SkillSuggestion>> getMySkillSuggestions() {
        try {
            String userId = getCurrentUserId();
            List<SkillSuggestion> suggestions = skillDevelopmentService.getMySkillSuggestions(userId);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get active skill suggestion
     */
    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SkillSuggestion> getActiveSkillSuggestion() {
        try {
            String userId = getCurrentUserId();
            return skillDevelopmentService.getActiveSkillSuggestion(userId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Mark skill as completed
     */
    @PutMapping("/complete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SkillSuggestion> markSkillCompleted(@RequestBody Map<String, String> request) {
        try {
            String userId = getCurrentUserId();
            String skill = request.get("skill");
            SkillSuggestion suggestion = skillDevelopmentService.markSkillCompleted(userId, skill);
            return ResponseEntity.ok(suggestion);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Helper method to get current user ID
     */
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (String) authentication.getPrincipal();
    }
}
