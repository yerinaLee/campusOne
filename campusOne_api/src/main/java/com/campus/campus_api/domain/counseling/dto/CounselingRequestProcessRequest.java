package com.campus.campus_api.domain.counseling.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CounselingRequestProcessRequest {
    @NotBlank(message = "상태는 필수입니다.")
    private String status; // ACCEPTED, REJECTED
    
    private String rejectReason;
}
