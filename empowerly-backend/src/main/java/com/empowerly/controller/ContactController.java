package com.empowerly.controller;

import com.empowerly.model.ContactMessage;
import com.empowerly.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitContactForm(@RequestBody ContactMessage contactMessage) {
        try {
            ContactMessage savedMessage = contactService.submitContactForm(contactMessage);
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error submitting contact form: " + e.getMessage());
        }
    }

    @GetMapping("/messages")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        return ResponseEntity.ok(contactService.getAllMessages());
    }

    @GetMapping("/messages/unsent")
    public ResponseEntity<List<ContactMessage>> getUnsentMessages() {
        return ResponseEntity.ok(contactService.getUnsentMessages());
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable String id) {
        try {
            contactService.deleteMessage(id);
            return ResponseEntity.ok("Message deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting message: " + e.getMessage());
        }
    }
}
