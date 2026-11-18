package com.tutorflow.backend.dto;

import com.tutorflow.backend.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BulkAttendanceRequest {
    @NotNull(message = "Branch ID is mandatory")
    private Long branchId;

    @NotNull(message = "Batch ID is mandatory")
    private Long batchId;

    @NotNull(message = "Attendance date is mandatory")
    private LocalDate attendanceDate;

    private List<StudentAttendanceItem> records;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StudentAttendanceItem {
        private Long studentId;
        private AttendanceStatus status;
        private String remarks;
    }
}

