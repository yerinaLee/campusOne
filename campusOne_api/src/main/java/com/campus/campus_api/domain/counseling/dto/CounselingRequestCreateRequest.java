package com.campus.campus_api.domain.counseling.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CounselingRequestCreateRequest {
    @NotBlank(message = "상담 유형은 필수입니다.")
    private String counselingType;
    
    private LocalDate preferredDate;
    
    @NotBlank(message = "상담 신청 사유는 필수입니다.")
    private String reason;
}
