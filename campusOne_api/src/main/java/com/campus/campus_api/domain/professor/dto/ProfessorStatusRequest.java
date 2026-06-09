package com.campus.campus_api.domain.professor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProfessorStatusRequest {
    @NotBlank
    private String status;
    private String reason;
}
