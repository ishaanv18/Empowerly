package com.empowerly.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    @NotBlank(message = "Receiver ID is required")
    private String receiverId;

    @NotBlank(message = "Message content is required")
    private String content;
}
