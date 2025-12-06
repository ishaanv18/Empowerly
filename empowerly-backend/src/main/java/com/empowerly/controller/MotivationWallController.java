package com.empowerly.controller;

import com.empowerly.model.MotivationPost;
import com.empowerly.service.MotivationWallService;
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
@RequestMapping("/api/motivation")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MotivationWallController {

    private final MotivationWallService motivationWallService;

    /**
     * Create a new motivation post
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MotivationPost> createPost(@RequestBody MotivationPost post) {
        try {
            String userId = getCurrentUserId();
            MotivationPost createdPost = motivationWallService.createPost(post, userId);
            return ResponseEntity.ok(createdPost);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all motivation posts
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MotivationPost>> getAllPosts() {
        try {
            List<MotivationPost> posts = motivationWallService.getAllPosts();
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get posts by category
     */
    @GetMapping("/category/{category}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MotivationPost>> getPostsByCategory(@PathVariable String category) {
        try {
            List<MotivationPost> posts = motivationWallService.getPostsByCategory(category);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get my posts
     */
    @GetMapping("/my-posts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MotivationPost>> getMyPosts() {
        try {
            String userId = getCurrentUserId();
            List<MotivationPost> posts = motivationWallService.getPostsByAuthor(userId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Like/Unlike a post
     */
    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MotivationPost> toggleLike(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            MotivationPost post = motivationWallService.toggleLike(id, userId);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Add comment to post
     */
    @PostMapping("/{id}/comment")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MotivationPost> addComment(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String userId = getCurrentUserId();
            String content = request.get("content");
            MotivationPost post = motivationWallService.addComment(id, userId, content);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Delete a post
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deletePost(@PathVariable String id) {
        try {
            String userId = getCurrentUserId();
            motivationWallService.deletePost(id, userId);
            return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get post by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MotivationPost> getPostById(@PathVariable String id) {
        try {
            MotivationPost post = motivationWallService.getPostById(id);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Generate AI quote
     */
    @PostMapping("/generate-quote")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> generateQuote(@RequestBody Map<String, String> request) {
        try {
            String category = request.getOrDefault("category", "QUOTE");
            String quote = motivationWallService.generateAIQuote(category);
            return ResponseEntity.ok(Map.of("quote", quote));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
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
