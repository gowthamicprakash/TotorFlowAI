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
public class AiActionRequest {
    private String intent; // e.g. "ADD_STUDENT", "RECORD_ATTENDANCE", "GET_OVERVIEW", "RECORD_PAYMENT"
    private Long branchId;
    private Map<String, Object> parameters;
}

