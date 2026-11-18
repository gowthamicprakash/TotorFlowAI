package com.tutorflow.backend.controller;

import com.tutorflow.backend.dto.FeeRecordDTO;
import com.tutorflow.backend.dto.PaymentDTO;
import com.tutorflow.backend.entity.Teacher;
import com.tutorflow.backend.service.FeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fees")
@RequiredArgsConstructor
public class FeeController {

    private final FeeService feeService;

    @GetMapping("/records/branch/{branchId}")
    public ResponseEntity<List<FeeRecordDTO>> getFeeRecordsByBranch(
            @PathVariable Long branchId,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(feeService.getFeeRecordsByBranch(branchId, teacher));
    }

    @GetMapping("/records/student/{studentId}")
    public ResponseEntity<List<FeeRecordDTO>> getFeeRecordsByStudent(
            @PathVariable Long studentId,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(feeService.getFeeRecordsByStudent(studentId, teacher));
    }

    @PostMapping("/records")
    public ResponseEntity<FeeRecordDTO> createFeeRecord(
            @Valid @RequestBody FeeRecordDTO dto,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(feeService.createFeeRecord(dto, teacher));
    }

    @PostMapping("/payments")
    public ResponseEntity<PaymentDTO> recordPayment(
            @Valid @RequestBody PaymentDTO dto,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(feeService.recordPayment(dto, teacher));
    }

    @GetMapping("/payments/branch/{branchId}")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByBranch(
            @PathVariable Long branchId,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(feeService.getPaymentsByBranch(branchId, teacher));
    }

    @GetMapping("/payments/student/{studentId}")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByStudent(
            @PathVariable Long studentId,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(feeService.getPaymentsByStudent(studentId, teacher));
    }
}

