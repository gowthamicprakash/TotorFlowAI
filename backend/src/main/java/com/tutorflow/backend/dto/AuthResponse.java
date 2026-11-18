package com.tutorflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private Long teacherId;
    private String fullName;
    private String email;
    private String businessName;
    private String teachingCategory;
}

