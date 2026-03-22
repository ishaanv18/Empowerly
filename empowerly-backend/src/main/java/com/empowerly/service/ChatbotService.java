package com.empowerly.service;

import com.empowerly.config.GroqConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class ChatbotService {

    private static final Logger logger = LoggerFactory.getLogger(ChatbotService.class);

    @Autowired
    private WebClient groqWebClient;

    @Autowired
    private GroqConfig groqConfig;

    @Autowired
    private TokenUsageService tokenUsageService;

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
            // Get current user ID
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userId = authentication.getName();

            // Check rate limits
            if (!tokenUsageService.canMakeRequest(userId)) {
                return "⚠️ You've reached your daily limit for AI requests. Your limit will reset at midnight IST. " +
                        "Please try again tomorrow or contact support if you need additional quota.";
            }

            // Build the request payload (OpenAI format for Groq)
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", groqConfig.getModel());

            ArrayNode messages = requestBody.putArray("messages");

            // Add system message
            ObjectNode systemMessage = messages.addObject();
            systemMessage.put("role", "system");
            systemMessage.put("content", SYSTEM_CONTEXT);

            // Add user message
            ObjectNode userMessageNode = messages.addObject();
            userMessageNode.put("role", "user");
            userMessageNode.put("content", userMessage);

            // Add generation config
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 1024);

            logger.info("Sending request to Groq API for user {}: {}", userId, userMessage);

            // Make API call
            String response = groqWebClient.post()
                    .body(Mono.just(requestBody), ObjectNode.class)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            logger.info("Received response from Groq API");

            // Parse response
            JsonNode responseJson = objectMapper.readTree(response);

            // Extract bot reply
            String botReply = responseJson
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

            // Extract token usage
            JsonNode usage = responseJson.path("usage");
            int promptTokens = usage.path("prompt_tokens").asInt();
            int completionTokens = usage.path("completion_tokens").asInt();

            // Record usage
            tokenUsageService.recordUsage(userId, promptTokens, completionTokens, "chatbot");

            logger.info("Chatbot response generated for user {} - Tokens used: {}",
                    userId, promptTokens + completionTokens);

            return botReply;

        } catch (Exception e) {
            logger.error("Error calling Groq API", e);
            return "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact support.";
        }
    }
}
