package com.tutorflow.backend.controller;

import com.tutorflow.backend.dto.StudentDTO;
import com.tutorflow.backend.entity.Teacher;
import com.tutorflow.backend.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<List<StudentDTO>> getStudents(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long batchId,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal Teacher teacher
    ) {
        if (search != null && branchId != null) {
            return ResponseEntity.ok(studentService.searchStudentsByName(branchId, search, teacher));
        }
        if (batchId != null) {
            return ResponseEntity.ok(studentService.getStudentsByBatch(batchId, teacher));
        }
        if (branchId != null) {
            return ResponseEntity.ok(studentService.getStudentsByBranch(branchId, teacher));
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id, @AuthenticationPrincipal Teacher teacher) {
        return ResponseEntity.ok(studentService.getStudentById(id, teacher));
    }

    @PostMapping
    public ResponseEntity<StudentDTO> createStudent(
            @Valid @RequestBody StudentDTO dto,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(studentService.createStudent(dto, teacher));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDTO> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentDTO dto,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(studentService.updateStudent(id, dto, teacher));
    }

    @PutMapping("/{id}/assign-batch/{batchId}")
    public ResponseEntity<StudentDTO> assignBatch(
            @PathVariable Long id,
            @PathVariable Long batchId,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(studentService.assignBatch(id, batchId, teacher));
    }
}

