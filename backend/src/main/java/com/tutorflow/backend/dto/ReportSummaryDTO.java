package com.tutorflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportSummaryDTO {
    private Long branchId;
    private String branchName;
    private long totalStudents;
    private long totalBatches;
    private BigDecimal totalFeesPending;
    private BigDecimal totalFeesCollected;
}

