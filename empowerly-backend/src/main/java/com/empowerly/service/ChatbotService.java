package com.empowerly.service;

import com.empowerly.config.GeminiConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class ChatbotService {

    private static final Logger logger = LoggerFactory.getLogger(ChatbotService.class);

    @Autowired
    private WebClient geminiWebClient;

    @Autowired
    private GeminiConfig geminiConfig;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SYSTEM_CONTEXT = """
            You are Sahaayak, an AI assistant for Empowerly - an employee management system.

            Empowerly features:
            - User Authentication: Signup with OTP verification via email
            - Role-based Access: Admin, HR, and Employee roles
            - Attendance Management: Check-in/Check-out with timeline tracking
            - Leave Management: Employees can apply for leaves, HR can approve/reject
            - Departments: Finance, HR, Backend, Frontend, DevOps

            Your role is to help users with:
            - Understanding how to use Empowerly features
            - Troubleshooting issues
            - Answering questions about attendance and leave policies
            - Providing guidance on navigation and functionality

            Be helpful, concise, and friendly. If you don't know something specific about the system,
            acknowledge it and suggest contacting support.
            """;

    public String chat(String userMessage) {
        try {
            // Build the request payload
            ObjectNode requestBody = objectMapper.createObjectNode();
            ArrayNode contents = requestBody.putArray("contents");

            // Add user message with system context
            ObjectNode userMessageNode = contents.addObject();
            userMessageNode.put("role", "user");
            ArrayNode userParts = userMessageNode.putArray("parts");

            // Combine system context and user message
            String fullMessage = SYSTEM_CONTEXT + "\n\nUser: " + userMessage;
            userParts.addObject().put("text", fullMessage);

            // Add generation config
            ObjectNode generationConfig = requestBody.putObject("generationConfig");
            generationConfig.put("temperature", 0.7);
            generationConfig.put("topK", 40);
            generationConfig.put("topP", 0.95);
            generationConfig.put("maxOutputTokens", 1024);

            logger.info("Sending request to Gemini API: {}", requestBody.toString());

            // Make API call
            String response = geminiWebClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .queryParam("key", geminiConfig.getApiKey())
                            .build())
                    .body(Mono.just(requestBody), ObjectNode.class)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            logger.info("Received response from Gemini API: {}", response);

            // Parse response
            JsonNode responseJson = objectMapper.readTree(response);
            String botReply = responseJson
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

            logger.info("Chatbot response generated for message: {}", userMessage);
            return botReply;

        } catch (Exception e) {
            logger.error("Error calling Gemini API", e);
            return "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact support.";
        }
    }
}
