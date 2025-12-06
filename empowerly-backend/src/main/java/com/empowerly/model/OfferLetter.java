package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "offer_letters")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferLetter {

    @Id
    private String id;

    private String employeeName;
    private String email;
    private String position;
    private Double salary;
    private String department;
    private LocalDate joiningDate;

    private String generatedBy; // HR name
    private String generatedById; // HR user ID
    private LocalDateTime generatedAt;

    private String pdfPath;
    private String pdfFileName;
}
