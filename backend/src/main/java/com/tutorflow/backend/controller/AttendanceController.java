package com.tutorflow.backend.controller;

import com.tutorflow.backend.dto.AttendanceDTO;
import com.tutorflow.backend.dto.BulkAttendanceRequest;
import com.tutorflow.backend.entity.Teacher;
import com.tutorflow.backend.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByBranch(
            @PathVariable Long branchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal Teacher teacher
    ) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(attendanceService.getAttendanceByBranchAndDate(branchId, queryDate, teacher));
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByBatch(
            @PathVariable Long batchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal Teacher teacher
    ) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(attendanceService.getAttendanceByBatchAndDate(batchId, queryDate, teacher));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByStudent(
            @PathVariable Long studentId,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(studentId, teacher));
    }

    @PostMapping
    public ResponseEntity<AttendanceDTO> recordAttendance(
            @Valid @RequestBody AttendanceDTO dto,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(attendanceService.recordOrUpdateAttendance(dto, teacher));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<AttendanceDTO>> recordBulkAttendance(
            @Valid @RequestBody BulkAttendanceRequest request,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(attendanceService.recordBulkAttendance(request, teacher));
    }
}

