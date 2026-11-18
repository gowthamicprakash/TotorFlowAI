package com.tutorflow.backend.controller;

import com.tutorflow.backend.dto.ReportSummaryDTO;
import com.tutorflow.backend.entity.Teacher;
import com.tutorflow.backend.service.OverviewReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final OverviewReportService overviewReportService;

    @GetMapping("/branch/{branchId}")
    public ResponseEntity<ReportSummaryDTO> getBranchReport(
            @PathVariable Long branchId,
            @AuthenticationPrincipal Teacher teacher
    ) {
        return ResponseEntity.ok(overviewReportService.getBranchReport(branchId, teacher));
    }
}

