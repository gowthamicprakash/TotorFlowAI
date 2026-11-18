package com.tutorflow.backend.dto;

import com.tutorflow.backend.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceDTO {
    private Long id;

    @NotNull(message = "Branch ID is mandatory")
    private Long branchId;

    @NotNull(message = "Batch ID is mandatory")
    private Long batchId;

    private String batchName;

    @NotNull(message = "Student ID is mandatory")
    private Long studentId;

    private String studentName;

    @NotNull(message = "Attendance date is mandatory")
    private LocalDate attendanceDate;

    @NotNull(message = "Attendance status is mandatory")
    private AttendanceStatus status;

    private String remarks;
}

