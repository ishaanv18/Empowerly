package com.empowerly.service;

import com.empowerly.config.JwtUtil;
import com.empowerly.dto.*;
import com.empowerly.model.OTP;
import com.empowerly.model.User;
import com.empowerly.repository.OTPRepository;
import com.empowerly.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Transactional
    public String signup(SignupRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create unverified user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDateOfBirth(request.getDateOfBirth());
        user.setDepartment(request.getDepartment());
        user.setRole(request.getRole());
        user.setVerified(false);
        user.setActive(true);

        userRepository.save(user);
        logger.info("User created (unverified): {}", user.getEmail());

        // Generate and send OTP
        String otpCode = generateOTP();
        saveOTP(request.getEmail(), otpCode);

        boolean emailSent = emailService.sendOTPEmail(request.getEmail(), otpCode, request.getName());

        if (!emailSent) {
            throw new RuntimeException("Failed to send OTP email. Please try again.");
        }

        return "Signup successful! Please check your email for OTP verification.";
    }

    @Transactional
    public AuthResponse verifyOTP(OTPVerificationRequest request) {
        // Find OTP record
        Optional<OTP> otpOptional = otpRepository.findByEmailAndOtpCode(request.getEmail(), request.getOtp());

        if (otpOptional.isEmpty()) {
            throw new RuntimeException("Invalid OTP");
        }

        OTP otp = otpOptional.get();

        // Check if OTP is expired (handled by MongoDB TTL, but double-check)
        if (otp.getCreatedAt().plusMinutes(5).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        // Find user and mark as verified
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setVerified(true);
        userRepository.save(user);

        // Delete OTP record
        otpRepository.delete(otp);

        logger.info("User verified successfully: {}", user.getEmail());

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(),
                user.getRole(), user.getDepartment());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!user.isVerified()) {
            throw new RuntimeException("Please verify your email first");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());

        logger.info("User logged in successfully: {}", user.getEmail());

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(),
                user.getRole(), user.getDepartment());
    }

    @Transactional
    public String resendOTP(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isVerified()) {
            throw new RuntimeException("User is already verified");
        }

        // Delete old OTP if exists
        otpRepository.findByEmail(email).ifPresent(otpRepository::delete);

        // Generate and send new OTP
        String otpCode = generateOTP();
        saveOTP(email, otpCode);

        boolean emailSent = emailService.sendOTPEmail(email, otpCode, user.getName());

        if (!emailSent) {
            throw new RuntimeException("Failed to send OTP email. Please try again.");
        }

        return "OTP resent successfully!";
    }

    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private void saveOTP(String email, String otpCode) {
        OTP otp = new OTP();
        otp.setEmail(email);
        otp.setOtpCode(otpCode);
        otp.setCreatedAt(LocalDateTime.now());
        otp.setVerified(false);

        otpRepository.save(otp);
        logger.info("OTP generated for: {}", email);
    }
}
