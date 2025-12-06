package com.empowerly.dto;

import com.empowerly.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private String id;
    private String name;
    private String email;
    private User.Role role;
    private User.Department department;
    private String message;

    public AuthResponse(String token, String id, String name, String email, User.Role role,
            User.Department department) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.department = department;
    }
}
