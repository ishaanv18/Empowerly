package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MotivationComment {
    private String userId;
    private String userName;
    private String content;
    private LocalDateTime createdAt;
}
