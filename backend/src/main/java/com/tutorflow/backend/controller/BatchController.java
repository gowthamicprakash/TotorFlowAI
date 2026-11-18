package com.tutorflow.backend.controller;

import com.tutorflow.backend.dto.BatchDTO;
import com.tutorflow.backend.entity.Teacher;
import com.tutorflow.backend.service.BatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    @GetMapping
    public ResponseEntity<List<BatchDTO>> getBatches(
            @RequestParam(required = false) Long branchId,
            @AuthenticationPrincipal Teacher teacher
    ) {
        if (branchId != null) {
            return ResponseEntity.ok(batchService.getBatchesByBranch(branchId, teacher));
        }
        return ResponseEntity.ok(batchService.getAllBatchesForTeacher(teacher));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BatchDTO> getBatchById(@PathVariable Long id, @AuthenticationPrincipal Teacher teacher) {
        return ResponseEntity.ok(batchService.getBatchById(id, teacher));
    }

    @PostMapping
    public ResponseEntity<BatchDTO> createBatch(
            @Valid @RequestBody BatchDTO dto,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(batchService.createBatch(dto, teacher));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BatchDTO> updateBatch(
            @PathVariable Long id,
            @Valid @RequestBody BatchDTO dto,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(batchService.updateBatch(id, dto, teacher));
    }
}

