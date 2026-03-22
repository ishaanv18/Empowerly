package com.empowerly.controller;

import com.empowerly.config.JwtUtil;
import com.empowerly.dto.LeaveActionRequest;
import com.empowerly.dto.LeaveDTO;
import com.empowerly.dto.LeaveRequest;
import com.empowerly.model.Leave;
import com.empowerly.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leave")
@CrossOrigin(origins = "*")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private JwtUtil jwtUtil;

    private String getUserIdFromToken(String token) {
        String jwtToken = token.replace("Bearer ", "");
        return jwtUtil.getUserIdFromToken(jwtToken);
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyLeave(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody LeaveRequest request) {
        try {
            String userId = getUserIdFromToken(token);
            Leave leave = leaveService.applyLeave(userId, request);
            return ResponseEntity.ok(leave);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/my-leaves")
    public ResponseEntity<?> getMyLeaves(@RequestHeader("Authorization") String token) {
        try {
            String userId = getUserIdFromToken(token);
            List<Leave> leaves = leaveService.getMyLeaves(userId);
            return ResponseEntity.ok(leaves);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingLeaves(@RequestHeader("Authorization") String token) {
        try {
            List<Leave> leaves = leaveService.getPendingLeaves();
            List<LeaveDTO> leaveDTOs = leaves.stream()
                    .map(LeaveDTO::fromLeave)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(leaveDTOs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllLeaves(@RequestHeader("Authorization") String token) {
        try {
            List<Leave> leaves = leaveService.getAllLeaves();
            List<LeaveDTO> leaveDTOs = leaves.stream()
                    .map(LeaveDTO::fromLeave)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(leaveDTOs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/approve/{leaveId}")
    public ResponseEntity<?> approveLeave(
            @RequestHeader("Authorization") String token,
            @PathVariable String leaveId,
            @RequestBody LeaveActionRequest request) {
        try {
            String userId = getUserIdFromToken(token);
            Leave leave = leaveService.approveLeave(leaveId, userId, request.getRemarks());
            return ResponseEntity.ok(leave);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/reject/{leaveId}")
    public ResponseEntity<?> rejectLeave(
            @RequestHeader("Authorization") String token,
            @PathVariable String leaveId,
            @RequestBody LeaveActionRequest request) {
        try {
            String userId = getUserIdFromToken(token);
            Leave leave = leaveService.rejectLeave(leaveId, userId, request.getRemarks());
            return ResponseEntity.ok(leave);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{leaveId}")
    public ResponseEntity<?> getLeaveById(
            @RequestHeader("Authorization") String token,
            @PathVariable String leaveId) {
        try {
            Leave leave = leaveService.getLeaveById(leaveId);
            return ResponseEntity.ok(leave);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/balance")
    public ResponseEntity<?> getLeaveBalance(@RequestHeader("Authorization") String token) {
        try {
            String userId = getUserIdFromToken(token);
            int currentYear = java.time.LocalDate.now().getYear();
            var balance = leaveService.getLeaveBalance(userId, currentYear);
            return ResponseEntity.ok(balance);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/balance/{year}")
    public ResponseEntity<?> getLeaveBalanceForYear(
            @RequestHeader("Authorization") String token,
            @PathVariable int year) {
        try {
            String userId = getUserIdFromToken(token);
            var balance = leaveService.getLeaveBalance(userId, year);
            return ResponseEntity.ok(balance);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/report/{year}")
    public ResponseEntity<?> getLeaveReport(
            @RequestHeader("Authorization") String token,
            @PathVariable int year) {
        try {
            String userId = getUserIdFromToken(token);
            var report = leaveService.getLeaveReport(userId, year);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/revoke/{leaveId}")
    public ResponseEntity<?> revokeLeave(
            @RequestHeader("Authorization") String token,
            @PathVariable String leaveId) {
        try {
            String userId = getUserIdFromToken(token);
            leaveService.revokeLeave(leaveId, userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Leave request cancelled successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
