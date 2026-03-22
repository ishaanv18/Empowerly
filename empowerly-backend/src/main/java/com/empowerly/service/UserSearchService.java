package com.empowerly.service;

import com.empowerly.dto.UserSearchResponse;
import com.empowerly.model.User;
import com.empowerly.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserSearchService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Search users by name or email (excluding current user)
     */
    public List<UserSearchResponse> searchUsers(String query, String currentUserId) {
        List<User> users;

        if (query == null || query.trim().isEmpty()) {
            // Return all users except current user
            users = userRepository.findAll().stream()
                    .filter(user -> !user.getId().equals(currentUserId) && user.isVerified())
                    .collect(Collectors.toList());
        } else {
            // Search by name or email
            users = userRepository.findAll().stream()
                    .filter(user -> !user.getId().equals(currentUserId) && user.isVerified())
                    .filter(user -> user.getName().toLowerCase().contains(query.toLowerCase()) ||
                            user.getEmail().toLowerCase().contains(query.toLowerCase()))
                    .collect(Collectors.toList());
        }

        return users.stream()
                .map(this::mapToSearchResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get users by department (excluding current user)
     */
    public List<UserSearchResponse> getUsersByDepartment(String department, String currentUserId) {
        List<User> users = userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(currentUserId) && user.isVerified())
                .filter(user -> user.getDepartment().toString().equalsIgnoreCase(department))
                .collect(Collectors.toList());

        return users.stream()
                .map(this::mapToSearchResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all verified users except current user
     */
    public List<UserSearchResponse> getAllUsers(String currentUserId) {
        List<User> users = userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(currentUserId) && user.isVerified())
                .collect(Collectors.toList());

        return users.stream()
                .map(this::mapToSearchResponse)
                .collect(Collectors.toList());
    }

    /**
     * Map User to UserSearchResponse
     */
    private UserSearchResponse mapToSearchResponse(User user) {
        return new UserSearchResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getDepartment().toString(),
                user.getRole().toString());
    }
}
