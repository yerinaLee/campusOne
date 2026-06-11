package com.campus.campus_api.domain.assignment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AssignmentGradeRequest {
    @NotNull(message = "점수는 필수입니다.")
    private BigDecimal score;
    private String feedback;
}
