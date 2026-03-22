package com.empowerly.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class GroqConfig {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model}")
    private String model;

    @Value("${groq.user.tokens.per.day}")
    private int userTokensPerDay;

    @Value("${groq.user.requests.per.day}")
    private int userRequestsPerDay;

    @Bean
    public WebClient groqWebClient() {
        return WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getModel() {
        return model;
    }

    public String getApiUrl() {
        return apiUrl;
    }

    public int getUserTokensPerDay() {
        return userTokensPerDay;
    }

    public int getUserRequestsPerDay() {
        return userRequestsPerDay;
    }
}
