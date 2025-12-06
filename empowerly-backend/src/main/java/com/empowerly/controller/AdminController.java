package com.empowerly.controller;

import com.empowerly.dto.AdminStatsResponse;
import com.empowerly.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getSystemStats() {
        AdminStatsResponse stats = adminService.getSystemStats();
        return ResponseEntity.ok(stats);
    }
}
