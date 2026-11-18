package com.tutorflow.backend.dto;

import jakarta.validation.constraints.NotBlank;
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
public class StudentDTO {
    private Long id;

    @NotNull(message = "Branch ID is mandatory")
    private Long branchId;

    private String branchName;
    private Long batchId;
    private String batchName;

    @NotBlank(message = "Student name is mandatory")
    private String fullName;

    @NotBlank(message = "Contact number is mandatory")
    private String contactNumber;

    private String parentOrGuardianName;
    private Integer age;
    private LocalDate dateOfBirth;
    private LocalDate joiningDate;
    private Boolean active;
}

