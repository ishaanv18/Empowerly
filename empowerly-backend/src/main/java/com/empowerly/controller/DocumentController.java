package com.empowerly.controller;

import com.empowerly.dto.AppointmentLetterDTO;
import com.empowerly.dto.OfferLetterDTO;
import com.empowerly.model.AppointmentLetter;
import com.empowerly.model.OfferLetter;
import com.empowerly.model.User;
import com.empowerly.repository.UserRepository;
import com.empowerly.service.DocumentGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentGenerationService documentGenerationService;
    private final UserRepository userRepository;

    /**
     * Generate offer letter (HR and Admin only)
     */
    @PostMapping("/offer-letter")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<OfferLetter> generateOfferLetter(@RequestBody OfferLetterDTO dto) {
        try {
            // Get current user from security context
            // Note: The principal is the user ID, not email (set in
            // JwtAuthenticationFilter)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userId = (String) authentication.getPrincipal();
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            OfferLetter offerLetter = documentGenerationService.generateOfferLetter(dto, currentUser);
            return ResponseEntity.ok(offerLetter);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate appointment letter (HR and Admin only)
     */
    @PostMapping("/appointment-letter")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<AppointmentLetter> generateAppointmentLetter(@RequestBody AppointmentLetterDTO dto) {
        try {
            // Get current user from security context
            // Note: The principal is the user ID, not email (set in
            // JwtAuthenticationFilter)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userId = (String) authentication.getPrincipal();
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AppointmentLetter appointmentLetter = documentGenerationService.generateAppointmentLetter(dto, currentUser);
            return ResponseEntity.ok(appointmentLetter);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Download offer letter PDF
     */
    @GetMapping("/offer-letter/{id}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<byte[]> downloadOfferLetter(@PathVariable String id) {
        try {
            byte[] pdfBytes = documentGenerationService.getOfferLetterPdf(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Offer_Letter.pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Download appointment letter PDF
     */
    @GetMapping("/appointment-letter/{id}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<byte[]> downloadAppointmentLetter(@PathVariable String id) {
        try {
            byte[] pdfBytes = documentGenerationService.getAppointmentLetterPdf(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Appointment_Letter.pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Get all generated documents
     */
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getDocumentHistory() {
        try {
            List<Map<String, Object>> documents = documentGenerationService.getAllDocuments();
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete a specific document (HR and Admin only)
     */
    @DeleteMapping("/{type}/{id}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, String>> deleteDocument(
            @PathVariable String type,
            @PathVariable String id) {
        try {
            documentGenerationService.deleteDocument(id, type);
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete all documents (HR and Admin only)
     */
    @DeleteMapping("/clear-all")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteAllDocuments() {
        try {
            int deletedCount = documentGenerationService.deleteAllDocuments();
            return ResponseEntity.ok(Map.of(
                    "message", "All documents deleted successfully",
                    "deletedCount", deletedCount));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete documents"));
        }
    }
}
