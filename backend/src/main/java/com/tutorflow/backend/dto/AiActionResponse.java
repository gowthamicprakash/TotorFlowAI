package com.tutorflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AiActionResponse {
    private boolean success;
    private String message;
    private Object data;
    private Map<String, Object> metadata;
}

