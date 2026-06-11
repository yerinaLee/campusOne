package com.campus.campus_api.domain.exam.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExamRegistrationRequest {
    @NotBlank(message = "신청 사유는 필수입니다.")
    private String reason;
}
