package com.tutorflow.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FeeRecordDTO {
    private Long id;

    @NotNull(message = "Branch ID is mandatory")
    private Long branchId;

    private String branchName;

    @NotNull(message = "Student ID is mandatory")
    private Long studentId;

    private String studentName;

    @NotBlank(message = "Title is mandatory")
    private String title;

    @NotNull(message = "Amount due is mandatory")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount due must be greater than zero")
    private BigDecimal amountDue;

    private BigDecimal amountPaid;
    private BigDecimal pendingAmount;
    private LocalDate dueDate;
}

