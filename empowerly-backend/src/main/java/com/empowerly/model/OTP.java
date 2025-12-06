package com.empowerly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "otps")
public class OTP {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String otpCode;

    @Indexed(expireAfterSeconds = 300) // 5 minutes
    private LocalDateTime createdAt;

    private boolean verified = false;
}
