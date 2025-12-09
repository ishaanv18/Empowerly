package com.empowerly.service;

import com.empowerly.model.MotivationComment;
import com.empowerly.model.MotivationPost;
import com.empowerly.model.User;
import com.empowerly.repository.MotivationPostRepository;
import com.empowerly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MotivationWallService {

    private final MotivationPostRepository motivationPostRepository;
    private final UserRepository userRepository;

    /**
     * Create a new motivation post
     */
    public MotivationPost createPost(MotivationPost post, String userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        post.setAuthorId(user.getId());
        post.setAuthorName(user.getName());
        post.setAuthorRole(user.getRole() != null ? user.getRole().toString() : "Employee");
        post.setCreatedAt(LocalDateTime.now());

        // Check if user is HR or Admin
        if (user.getRole() != null) {
            String roleStr = user.getRole().toString();
            if ("HR".equals(roleStr) || "ADMIN".equals(roleStr)) {
                post.setIsHRPost(true);
            }
        }

        return motivationPostRepository.save(post);
    }

    /**
     * Get all posts
     */
    public List<MotivationPost> getAllPosts() {
        return motivationPostRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Get posts by category
     */
    public List<MotivationPost> getPostsByCategory(String category) {
        return motivationPostRepository.findByCategoryOrderByCreatedAtDesc(category);
    }

    /**
     * Get posts by author
     */
    public List<MotivationPost> getPostsByAuthor(String authorId) {
        return motivationPostRepository.findByAuthorIdOrderByCreatedAtDesc(authorId);
    }

    /**
     * Like/Unlike a post
     */
    public MotivationPost toggleLike(String postId, String userId) throws Exception {
        MotivationPost post = motivationPostRepository.findById(postId)
                .orElseThrow(() -> new Exception("Post not found"));

        if (post.getLikes().contains(userId)) {
            post.getLikes().remove(userId);
        } else {
            post.getLikes().add(userId);
        }

        return motivationPostRepository.save(post);
    }

    /**
     * Add comment to post
     */
    public MotivationPost addComment(String postId, String userId, String content) throws Exception {
        MotivationPost post = motivationPostRepository.findById(postId)
                .orElseThrow(() -> new Exception("Post not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        MotivationComment comment = new MotivationComment();
        comment.setUserId(user.getId());
        comment.setUserName(user.getName());
        comment.setContent(content);
        comment.setCreatedAt(LocalDateTime.now());

        post.getComments().add(comment);

        return motivationPostRepository.save(post);
    }

    /**
     * Delete a post (own post or HR can delete any)
     */
    public void deletePost(String postId, String userId) throws Exception {
        MotivationPost post = motivationPostRepository.findById(postId)
                .orElseThrow(() -> new Exception("Post not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        // Check if user is the author or HR/Admin
        boolean isAuthor = post.getAuthorId().equals(userId);
        boolean isHROrAdmin = user.getRole() != null &&
                (user.getRole().toString().equals("HR") || user.getRole().toString().equals("ADMIN"));

        if (!isAuthor && !isHROrAdmin) {
            throw new Exception("You don't have permission to delete this post");
        }

        motivationPostRepository.deleteById(postId);
    }

    /**
     * Get post by ID
     */
    public MotivationPost getPostById(String postId) throws Exception {
        return motivationPostRepository.findById(postId)
                .orElseThrow(() -> new Exception("Post not found"));
    }

    /**
     * Generate AI-powered inspirational quote
     */
    public String generateAIQuote(String category) throws Exception {
        try {
            String prompt = createQuotePrompt(category);
            String response = callGeminiAPI(prompt);
            return parseQuoteResponse(response);
        } catch (Exception e) {
            throw new Exception("Failed to generate quote: " + e.getMessage());
        }
    }

    private String createQuotePrompt(String category) {
        String categoryContext = switch (category) {
            case "ACHIEVEMENT" -> "achievement, success, and accomplishment";
            case "LEARNING" -> "learning, growth, and knowledge";
            case "QUOTE" -> "motivation, inspiration, and positivity";
            case "ANNOUNCEMENT" -> "teamwork, collaboration, and unity";
            default -> "motivation and inspiration";
        };

        return String.format("""
                Generate a single inspirational quote about %s.
                The quote should be:
                - Motivating and uplifting
                - Professional and workplace-appropriate
                - Between 10-30 words
                - Original and meaningful

                Return ONLY the quote text, nothing else. No quotation marks, no attribution, just the quote.
                """, categoryContext);
    }

    private String callGeminiAPI(String prompt) throws Exception {
        try {
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();

            com.google.gson.JsonObject requestBody = new com.google.gson.JsonObject();
            com.google.gson.JsonArray contents = new com.google.gson.JsonArray();
            com.google.gson.JsonObject content = new com.google.gson.JsonObject();
            com.google.gson.JsonArray parts = new com.google.gson.JsonArray();
            com.google.gson.JsonObject part = new com.google.gson.JsonObject();

            part.addProperty("text", prompt);
            parts.add(part);
            content.add("parts", parts);
            contents.add(content);
            requestBody.add("contents", contents);

            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(
                            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="
                                    + getGeminiApiKey()))
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                    .build();

            java.net.http.HttpResponse<String> response = client.send(request,
                    java.net.http.HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Gemini API error: " + response.body());
            }

            return response.body();
        } catch (Exception e) {
            throw new Exception("API call failed: " + e.getMessage());
        }
    }

    private String parseQuoteResponse(String apiResponse) {
        try {
            com.google.gson.Gson gson = new com.google.gson.Gson();
            com.google.gson.JsonObject responseJson = gson.fromJson(apiResponse, com.google.gson.JsonObject.class);

            String quote = responseJson
                    .getAsJsonArray("candidates")
                    .get(0).getAsJsonObject()
                    .getAsJsonObject("content")
                    .getAsJsonArray("parts")
                    .get(0).getAsJsonObject()
                    .get("text").getAsString();

            return quote.trim().replaceAll("^\"|\"$", "");
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse quote: " + e.getMessage());
        }
    }

    private String getGeminiApiKey() {
        // This will be injected via @Value annotation
        return System.getProperty("gemini.api.key", "AIzaSyBebqnloWynWEsD9eW6JH26K_FOE9ukMig");
    }
}
