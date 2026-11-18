package com.tutorflow.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClassScheduleDTO {
    private Long id;

    @NotNull(message = "Branch ID is mandatory")
    private Long branchId;

    private String branchName;

    @NotNull(message = "Batch ID is mandatory")
    private Long batchId;

    private String batchName;

    @NotNull(message = "Day of week is mandatory")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Start time is mandatory")
    private LocalTime startTime;

    @NotNull(message = "End time is mandatory")
    private LocalTime endTime;

    private String roomOrLocation;
}

