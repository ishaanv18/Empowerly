package com.empowerly.service;

import com.empowerly.config.GroqConfig;
import com.empowerly.model.CourseRecommendation;
import com.empowerly.model.SkillSuggestion;
import com.empowerly.model.User;
import com.empowerly.repository.SkillSuggestionRepository;
import com.empowerly.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SkillDevelopmentService {

    private final SkillSuggestionRepository skillSuggestionRepository;
    private final UserRepository userRepository;
    private final WebClient groqWebClient;
    private final GroqConfig groqConfig;
    private final TokenUsageService tokenUsageService;
    private final ObjectMapper objectMapper;

    /**
     * Generate personalized skill suggestions using Groq AI
     */
    public SkillSuggestion generateSkillSuggestions(String userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        // Check rate limits
        if (!tokenUsageService.canMakeRequest(userId)) {
            throw new Exception("Daily AI usage limit exceeded. Please try again tomorrow.");
        }

        // Create AI prompt
        String prompt = createSkillPrompt(user);

        // Call Groq API
        JsonNode response = callGroqAPI(prompt);

        // Extract token usage
        int promptTokens = response.path("usage").path("prompt_tokens").asInt(0);
        int completionTokens = response.path("usage").path("completion_tokens").asInt(0);

        // Record usage
        tokenUsageService.recordUsage(userId, promptTokens, completionTokens, "skills");

        // Parse response and create skill suggestion
        String aiText = response.path("choices").get(0).path("message").path("content").asText();
        SkillSuggestion suggestion = parseAIResponse(aiText, user);
        suggestion.setGeneratedAt(LocalDateTime.now());

        return skillSuggestionRepository.save(suggestion);
    }

    /**
     * Get user's skill suggestions
     */
    public List<SkillSuggestion> getMySkillSuggestions(String userId) {
        return skillSuggestionRepository.findByUserIdOrderByGeneratedAtDesc(userId);
    }

    /**
     * Get active skill suggestion
     */
    public Optional<SkillSuggestion> getActiveSkillSuggestion(String userId) {
        return skillSuggestionRepository.findFirstByUserIdAndStatusOrderByGeneratedAtDesc(userId, "ACTIVE");
    }

    /**
     * Mark skill as completed
     */
    public SkillSuggestion markSkillCompleted(String userId, String skill) throws Exception {
        SkillSuggestion suggestion = skillSuggestionRepository
                .findFirstByUserIdAndStatusOrderByGeneratedAtDesc(userId, "ACTIVE")
                .orElseThrow(() -> new Exception("No active skill suggestion found"));

        if (!suggestion.getCompletedSkills().contains(skill)) {
            suggestion.getCompletedSkills().add(skill);
        }

        // If all skills completed, mark as COMPLETED
        if (suggestion.getCompletedSkills().size() >= suggestion.getSuggestedSkills().size()) {
            suggestion.setStatus("COMPLETED");
        }

        return skillSuggestionRepository.save(suggestion);
    }

    /**
     * Create AI prompt for skill suggestions
     */
    private String createSkillPrompt(User user) {
        String role = user.getRole() != null ? user.getRole().toString() : "Employee";
        String department = user.getDepartment() != null ? user.getDepartment().toString() : "General";

        return String.format(
                """
                        You are a career development AI assistant. Analyze this employee profile and provide personalized skill development recommendations.

                        Employee Profile:
                        - Name: %s
                        - Role: %s
                        - Department: %s

                        Please provide:
                        1. 5-7 relevant skills this employee should develop based on their role and department
                        2. For each skill, recommend 2-3 FREE online courses from platforms like Coursera, edX, YouTube, freeCodeCamp, Khan Academy, or Udacity

                        Format your response as JSON with this exact structure:
                        {
                          "skills": ["skill1", "skill2", ...],
                          "courses": [
                            {
                              "title": "Course Title",
                              "platform": "Platform Name",
                              "url": "https://...",
                              "description": "Brief description",
                              "duration": "X hours/weeks",
                              "level": "Beginner/Intermediate/Advanced"
                            }
                          ]
                        }

                        IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting.
                        """,
                user.getName(),
                role,
                department);
    }

    /**
     * Call Groq API
     */
    private JsonNode callGroqAPI(String prompt) throws Exception {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", groqConfig.getModel());

            ArrayNode messages = requestBody.putArray("messages");
            ObjectNode message = messages.addObject();
            message.put("role", "user");
            message.put("content", prompt);

            String response = groqWebClient.post()
                    .uri(groqConfig.getApiUrl())
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError() || status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .flatMap(errorBody -> Mono
                                            .error(new RuntimeException("Groq API error: " + errorBody))))
                    .bodyToMono(String.class)
                    .block();

            return objectMapper.readTree(response);
        } catch (Exception e) {
            throw new Exception("Failed to call Groq API: " + e.getMessage(), e);
        }
    }

    /**
     * Parse AI response and create SkillSuggestion
     */
    private SkillSuggestion parseAIResponse(String aiText, User user) {
        try {
            // Clean up the text (remove markdown code blocks if present)
            aiText = aiText.replaceAll("```json\\n?", "").replaceAll("```\\n?", "").trim();

            // Parse the actual skill data
            JsonNode skillData = objectMapper.readTree(aiText);

            SkillSuggestion suggestion = new SkillSuggestion();
            suggestion.setUserId(user.getId());
            suggestion.setUserName(user.getName());
            suggestion.setUserRole(user.getRole() != null ? user.getRole().toString() : "Employee");
            suggestion.setDepartment(user.getDepartment() != null ? user.getDepartment().toString() : "General");

            // Parse skills
            List<String> skills = new ArrayList<>();
            JsonNode skillsArray = skillData.get("skills");
            if (skillsArray != null && skillsArray.isArray()) {
                for (JsonNode skillNode : skillsArray) {
                    skills.add(skillNode.asText());
                }
            }
            suggestion.setSuggestedSkills(skills);

            // Parse courses
            List<CourseRecommendation> courses = new ArrayList<>();
            JsonNode coursesArray = skillData.get("courses");
            if (coursesArray != null && coursesArray.isArray()) {
                for (JsonNode courseNode : coursesArray) {
                    CourseRecommendation course = new CourseRecommendation();
                    course.setTitle(courseNode.get("title").asText());
                    course.setPlatform(courseNode.get("platform").asText());
                    course.setUrl(courseNode.get("url").asText());
                    course.setDescription(courseNode.get("description").asText());
                    course.setDuration(courseNode.get("duration").asText());
                    course.setLevel(courseNode.get("level").asText());
                    courses.add(course);
                }
            }
            suggestion.setRecommendedCourses(courses);

            return suggestion;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage(), e);
        }
    }
}
