package com.tutorflow.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BatchDTO {
    private Long id;

    @NotNull(message = "Branch ID is mandatory")
    private Long branchId;

    private String branchName;

    @NotBlank(message = "Batch name is mandatory")
    private String name;

    private String subjectOrProgramme;
    private String scheduleDays;
    private String timings;
    private Integer maxCapacity;
    private Long studentCount;
}

