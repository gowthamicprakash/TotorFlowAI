package com.tutorflow.backend.controller;

import com.tutorflow.backend.dto.ClassScheduleDTO;
import com.tutorflow.backend.entity.Teacher;
import com.tutorflow.backend.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<ClassScheduleDTO>> getSchedulesByBranch(
            @PathVariable Long branchId,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(scheduleService.getSchedulesByBranch(branchId, teacher));
    }

    @GetMapping("/branch/{branchId}/today")
    public ResponseEntity<List<ClassScheduleDTO>> getTodaySchedulesByBranch(
            @PathVariable Long branchId,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(scheduleService.getTodaySchedulesByBranch(branchId, teacher));
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<ClassScheduleDTO>> getSchedulesByBatch(
            @PathVariable Long batchId,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(scheduleService.getSchedulesByBatch(batchId, teacher));
    }

    @PostMapping
    public ResponseEntity<ClassScheduleDTO> createSchedule(
            @Valid @RequestBody ClassScheduleDTO dto,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(scheduleService.createSchedule(dto, teacher));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassScheduleDTO> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody ClassScheduleDTO dto,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(scheduleService.updateSchedule(id, dto, teacher));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(
            @PathVariable Long id,
            @AuthenticationPrincipal Teacher teacher
    ) {
        scheduleService.deleteSchedule(id, teacher);
        return ResponseEntity.noContent().build();
    }
}

