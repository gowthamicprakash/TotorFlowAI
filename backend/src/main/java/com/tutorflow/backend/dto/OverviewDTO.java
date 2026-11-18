package com.tutorflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OverviewDTO {
    private Long branchId;
    private String branchName;
    private long totalStudents;
    private long activeBatches;
    private long todayClasses;
    private long todayPresentAttendance;
    private long todayTotalAttendanceRecorded;
    private BigDecimal pendingFees;
    private List<ClassScheduleDTO> upcomingClasses;
}

