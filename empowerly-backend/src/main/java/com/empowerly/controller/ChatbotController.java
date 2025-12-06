package com.empowerly.controller;

import com.empowerly.dto.ChatRequest;
import com.empowerly.service.ChatbotService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/ask")
    public ResponseEntity<?> chat(@Valid @RequestBody ChatRequest request) {
        try {
            String response = chatbotService.chat(request.getMessage());
            Map<String, String> result = new HashMap<>();
            result.put("response", response);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to process your request. Please try again.");
            return ResponseEntity.badRequest().body(error);
        }
    }
}
