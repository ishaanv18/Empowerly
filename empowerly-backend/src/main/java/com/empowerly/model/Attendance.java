package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Duration;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "attendance")
public class Attendance {

    @Id
    private String id;

    @DBRef
    private User user;

    private LocalDate date; // Date of attendance

    private LocalDateTime checkInTime;

    private LocalDateTime checkOutTime;

    private Long durationMinutes;

    private Double totalWorkHours; // Total work hours for the day

    private String status; // CHECKED_IN, CHECKED_OUT

    private String attendanceStatus; // PRESENT, ABSENT, HALF_DAY, LATE

    private Boolean isLate; // Whether check-in was late (after 10 AM)

    private Boolean isOvertime; // Whether overtime was worked

    private Long overtimeMinutes; // Overtime duration in minutes

    @CreatedDate
    private LocalDateTime createdAt;

    public void calculateDuration() {
        if (checkInTime != null && checkOutTime != null) {
            Duration duration = Duration.between(checkInTime, checkOutTime);
            this.durationMinutes = duration.toMinutes();
            this.totalWorkHours = durationMinutes / 60.0;
        }
    }

    public void checkIfLate() {
        if (checkInTime != null) {
            LocalTime checkInTimeOnly = checkInTime.toLocalTime();
            LocalTime lateThreshold = LocalTime.of(10, 0); // 10:00 AM
            this.isLate = checkInTimeOnly.isAfter(lateThreshold);
        }
    }

    public void calculateOvertime() {
        if (totalWorkHours != null && totalWorkHours > 8.0) {
            this.isOvertime = true;
            this.overtimeMinutes = (long) ((totalWorkHours - 8.0) * 60);
        } else {
            this.isOvertime = false;
            this.overtimeMinutes = 0L;
        }
    }

    public void calculateAttendanceStatus() {
        if (checkInTime == null) {
            this.attendanceStatus = "ABSENT";
            return;
        }

        if (totalWorkHours == null || totalWorkHours == 0) {
            // Still checked in, no checkout yet
            this.attendanceStatus = "PRESENT";
            return;
        }

        // Check for half day (less than 4 hours)
        if (totalWorkHours < 4.0) {
            this.attendanceStatus = "HALF_DAY";
        } else if (isLate != null && isLate) {
            this.attendanceStatus = "LATE";
        } else {
            this.attendanceStatus = "PRESENT";
        }
    }
}
