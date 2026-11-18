package com.tutorflow.backend.dto;

import com.tutorflow.backend.entity.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
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
public class PaymentDTO {
    private Long id;

    @NotNull(message = "Branch ID is mandatory")
    private Long branchId;

    @NotNull(message = "Student ID is mandatory")
    private Long studentId;

    private String studentName;
    private Long feeRecordId;

    @NotNull(message = "Amount is mandatory")
    @DecimalMin(value = "0.0", inclusive = false, message = "Payment amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Payment date is mandatory")
    private LocalDate paymentDate;

    private PaymentMethod paymentMethod;
    private String notes;
}

