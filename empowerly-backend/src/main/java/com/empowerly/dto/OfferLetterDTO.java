package com.empowerly.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class OfferLetterDTO {
    private String employeeName;
    private String email;
    private String position;
    private Double salary;
    private String department;
    private LocalDate joiningDate;
}
