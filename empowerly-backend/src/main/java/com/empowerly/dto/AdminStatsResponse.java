package com.empowerly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long totalEmployees;
    private long totalHR;
    private long totalAdmins;
    private long activeToday;
}
