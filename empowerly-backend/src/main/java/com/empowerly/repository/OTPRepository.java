package com.empowerly.repository;

import com.empowerly.model.OTP;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OTPRepository extends MongoRepository<OTP, String> {

    Optional<OTP> findByEmail(String email);

    Optional<OTP> findByEmailAndOtpCode(String email, String otpCode);

    void deleteByEmail(String email);
}
