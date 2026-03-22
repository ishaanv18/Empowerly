package com.empowerly.controller;

import com.empowerly.config.JwtUtil;
import com.empowerly.dto.UserSearchResponse;
import com.empowerly.service.UserSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserSearchController {

    @Autowired
    private UserSearchService userSearchService;

    @Autowired
    private JwtUtil jwtUtil;

    private String getUserIdFromToken(String token) {
        String jwtToken = token.replace("Bearer ", "");
        return jwtUtil.getUserIdFromToken(jwtToken);
    }

    /**
     * Search users by name or email
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String query) {
        try {
            String currentUserId = getUserIdFromToken(token);
            List<UserSearchResponse> users = userSearchService.searchUsers(query, currentUserId);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get users by department
     */
    @GetMapping("/department/{department}")
    public ResponseEntity<?> getUsersByDepartment(
            @RequestHeader("Authorization") String token,
            @PathVariable String department) {
        try {
            String currentUserId = getUserIdFromToken(token);
            List<UserSearchResponse> users = userSearchService.getUsersByDepartment(department, currentUserId);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get all users
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String token) {
        try {
            String currentUserId = getUserIdFromToken(token);
            List<UserSearchResponse> users = userSearchService.getAllUsers(currentUserId);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
