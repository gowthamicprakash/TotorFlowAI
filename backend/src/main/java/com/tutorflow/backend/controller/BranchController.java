package com.tutorflow.backend.controller;

import com.tutorflow.backend.dto.BranchDTO;
import com.tutorflow.backend.entity.Teacher;
import com.tutorflow.backend.service.BranchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @GetMapping
    public ResponseEntity<List<BranchDTO>> getBranches(@AuthenticationPrincipal Teacher teacher) {
        return ResponseEntity.ok(branchService.getBranchesForTeacher(teacher));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BranchDTO> getBranchById(@PathVariable Long id, @AuthenticationPrincipal Teacher teacher) {
        return ResponseEntity.ok(branchService.getBranchById(id, teacher));
    }

    @PostMapping
    public ResponseEntity<BranchDTO> createBranch(
            @Valid @RequestBody BranchDTO dto,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(branchService.createBranch(dto, teacher));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BranchDTO> updateBranch(
            @PathVariable Long id,
            @Valid @RequestBody BranchDTO dto,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(branchService.updateBranch(id, dto, teacher));
    }
}

