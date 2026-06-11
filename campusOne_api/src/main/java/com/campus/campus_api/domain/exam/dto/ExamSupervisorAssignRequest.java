package com.campus.campus_api.domain.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExamSupervisorAssignRequest {
    @NotNull(message = "감독관 ID는 필수입니다.")
    private Long supervisorId;

    @NotBlank(message = "역할은 필수입니다.")
    private String role;
}
