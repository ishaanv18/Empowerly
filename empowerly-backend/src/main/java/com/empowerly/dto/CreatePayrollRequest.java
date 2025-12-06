package com.empowerly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePayrollRequest {
    private int month; // 1-12
    private int year;
    private String hrNotes;
}
