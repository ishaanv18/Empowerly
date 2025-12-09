package com.empowerly.service;

import com.empowerly.model.CourseRecommendation;
import com.empowerly.model.SkillSuggestion;
import com.empowerly.model.User;
import com.empowerly.repository.SkillSuggestionRepository;
import com.empowerly.repository.UserRepository;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SkillDevelopmentService {

    private final SkillSuggestionRepository skillSuggestionRepository;
    private final UserRepository userRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b:generateContent";

    /**
     * Generate personalized skill suggestions using Gemini AI
     */
    public SkillSuggestion generateSkillSuggestions(String userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        // Create AI prompt
        String prompt = createSkillPrompt(user);

        // Call Gemini API
        String aiResponse = callGeminiAPI(prompt);

        // Parse response and create skill suggestion
        SkillSuggestion suggestion = parseAIResponse(aiResponse, user);
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
     * Call Gemini API
     */
    private String callGeminiAPI(String prompt) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newHttpClient();

        JsonObject requestBody = new JsonObject();
        JsonArray contents = new JsonArray();
        JsonObject content = new JsonObject();
        JsonArray parts = new JsonArray();
        JsonObject part = new JsonObject();

        part.addProperty("text", prompt);
        parts.add(part);
        content.add("parts", parts);
        contents.add(content);
        requestBody.add("contents", contents);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GEMINI_API_URL + "?key=" + geminiApiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Gemini API error: " + response.body());
        }

        return response.body();
    }

    /**
     * Parse AI response and create SkillSuggestion
     */
    private SkillSuggestion parseAIResponse(String aiResponse, User user) {
        try {
            Gson gson = new Gson();
            JsonObject responseJson = gson.fromJson(aiResponse, JsonObject.class);

            // Extract text from Gemini response
            String text = responseJson
                    .getAsJsonArray("candidates")
                    .get(0).getAsJsonObject()
                    .getAsJsonObject("content")
                    .getAsJsonArray("parts")
                    .get(0).getAsJsonObject()
                    .get("text").getAsString();

            // Clean up the text (remove markdown code blocks if present)
            text = text.replaceAll("```json\\n?", "").replaceAll("```\\n?", "").trim();

            // Parse the actual skill data
            JsonObject skillData = gson.fromJson(text, JsonObject.class);

            SkillSuggestion suggestion = new SkillSuggestion();
            suggestion.setUserId(user.getId());
            suggestion.setUserName(user.getName());
            suggestion.setUserRole(user.getRole() != null ? user.getRole().toString() : "Employee");
            suggestion.setDepartment(user.getDepartment() != null ? user.getDepartment().toString() : "General");

            // Parse skills
            List<String> skills = new ArrayList<>();
            JsonArray skillsArray = skillData.getAsJsonArray("skills");
            for (int i = 0; i < skillsArray.size(); i++) {
                skills.add(skillsArray.get(i).getAsString());
            }
            suggestion.setSuggestedSkills(skills);

            // Parse courses
            List<CourseRecommendation> courses = new ArrayList<>();
            JsonArray coursesArray = skillData.getAsJsonArray("courses");
            for (int i = 0; i < coursesArray.size(); i++) {
                JsonObject courseObj = coursesArray.get(i).getAsJsonObject();
                CourseRecommendation course = new CourseRecommendation();
                course.setTitle(courseObj.get("title").getAsString());
                course.setPlatform(courseObj.get("platform").getAsString());
                course.setUrl(courseObj.get("url").getAsString());
                course.setDescription(courseObj.get("description").getAsString());
                course.setDuration(courseObj.get("duration").getAsString());
                course.setLevel(courseObj.get("level").getAsString());
                courses.add(course);
            }
            suggestion.setRecommendedCourses(courses);

            return suggestion;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage(), e);
        }
    }
}
