package com.tutorflow.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BranchDTO {
    private Long id;

    @NotBlank(message = "Branch name is mandatory")
    private String name;

    private String address;
    private String contactNumber;
    private String email;
}

