package com.campus.campus_api.domain.exam.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExamStatusUpdateRequest {
    @NotBlank(message = "상태는 필수입니다.")
    private String status;
}
