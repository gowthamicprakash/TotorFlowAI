package com.tutorflow.backend.controller;

import com.tutorflow.backend.dto.AiActionRequest;
import com.tutorflow.backend.dto.AiActionResponse;
import com.tutorflow.backend.entity.Teacher;
import com.tutorflow.backend.service.AiActionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiActionService aiActionService;

    @PostMapping("/execute")
    public ResponseEntity<AiActionResponse> executeAction(
            @Valid @RequestBody AiActionRequest request,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(aiActionService.executeAction(request, teacher));
    }
}

