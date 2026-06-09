package com.campus.campus_api.domain.enrollment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class EnrollRequest {
    @NotNull(message = "강의 ID는 필수입니다.")
    private Long courseId;
}
