package com.empowerly.controller;

import com.empowerly.config.JwtUtil;
import com.empowerly.model.Attendance;
import com.empowerly.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private JwtUtil jwtUtil;

    private String getUserIdFromToken(String token) {
        String jwtToken = token.replace("Bearer ", "");
        return jwtUtil.getUserIdFromToken(jwtToken);
    }

    @PostMapping("/checkin")
    public ResponseEntity<?> checkIn(@RequestHeader("Authorization") String token) {
        try {
            String userId = getUserIdFromToken(token);
            Attendance attendance = attendanceService.checkIn(userId);
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkOut(@RequestHeader("Authorization") String token) {
        try {
            String userId = getUserIdFromToken(token);
            Attendance attendance = attendanceService.checkOut(userId);
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@RequestHeader("Authorization") String token) {
        try {
            String userId = getUserIdFromToken(token);
            List<Attendance> history = attendanceService.getUserAttendanceHistory(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/today")
    public ResponseEntity<?> getTodayAttendance(@RequestHeader("Authorization") String token) {
        try {
            String userId = getUserIdFromToken(token);
            return ResponseEntity.ok(attendanceService.getTodayAttendance(userId));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus(@RequestHeader("Authorization") String token) {
        try {
            String userId = getUserIdFromToken(token);
            String status = attendanceService.getAttendanceStatus(userId);
            Map<String, String> response = new HashMap<>();
            response.put("status", status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/month/{year}/{month}")
    public ResponseEntity<?> getMonthlyAttendance(
            @RequestHeader("Authorization") String token,
            @PathVariable int year,
            @PathVariable int month) {
        try {
            String userId = getUserIdFromToken(token);
            List<Attendance> attendance = attendanceService.getUserAttendanceForMonth(userId, year, month);
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/report")
    public ResponseEntity<?> getAttendanceReport(
            @RequestHeader("Authorization") String token,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            String userId = getUserIdFromToken(token);
            Map<String, Object> report = attendanceService.getAttendanceReport(userId, startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/stats/monthly")
    public ResponseEntity<?> getMonthlyStats(
            @RequestHeader("Authorization") String token,
            @RequestParam int year,
            @RequestParam int month) {
        try {
            String userId = getUserIdFromToken(token);
            Map<String, Object> stats = attendanceService.getMonthlyStats(userId, year, month);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllAttendance(@RequestHeader("Authorization") String token) {
        try {
            List<Map<String, Object>> allAttendance = attendanceService.getAllAttendanceWithUserDetails();
            return ResponseEntity.ok(allAttendance);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
