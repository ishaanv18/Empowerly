package com.empowerly.service;

import com.empowerly.config.GroqConfig;
import com.empowerly.model.MotivationComment;
import com.empowerly.model.MotivationPost;
import com.empowerly.model.User;
import com.empowerly.repository.MotivationPostRepository;
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
import java.util.List;

@Service
@RequiredArgsConstructor
public class MotivationWallService {

    private final MotivationPostRepository motivationPostRepository;
    private final UserRepository userRepository;
    private final WebClient groqWebClient;
    private final GroqConfig groqConfig;
    private final TokenUsageService tokenUsageService;
    private final ObjectMapper objectMapper;

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
    public String generateAIQuote(String category, String userId) throws Exception {
        // Check rate limits
        if (!tokenUsageService.canMakeRequest(userId)) {
            throw new Exception("Daily AI usage limit exceeded. Please try again tomorrow.");
        }

        try {
            String prompt = createQuotePrompt(category);
            JsonNode response = callGroqAPI(prompt);

            // Extract token usage
            int promptTokens = response.path("usage").path("prompt_tokens").asInt(0);
            int completionTokens = response.path("usage").path("completion_tokens").asInt(0);

            // Record usage
            tokenUsageService.recordUsage(userId, promptTokens, completionTokens, "motivation");

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
            throw new Exception("API call failed: " + e.getMessage());
        }
    }

    private String parseQuoteResponse(JsonNode response) {
        try {
            String quote = response.path("choices").get(0).path("message").path("content").asText();
            return quote.trim().replaceAll("^\"|\"$", "");
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse quote: " + e.getMessage());
        }
    }
}
