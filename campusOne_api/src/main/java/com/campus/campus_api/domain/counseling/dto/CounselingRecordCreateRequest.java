package com.campus.campus_api.domain.counseling.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class CounselingRecordCreateRequest {
    private Long requestId; // 선택적 (직접 기록 시 null)
    
    @NotNull(message = "학생 ID는 필수입니다.")
    private Long studentId;
    
    @NotBlank(message = "상담 유형은 필수입니다.")
    private String counselingType;
    
    @NotBlank(message = "제목은 필수입니다.")
    private String subject;
    
    @NotBlank(message = "상담 내용은 필수입니다.")
    private String content;
    
    private String outcome;
    private String followUp;
    
    @NotNull(message = "상담 일시는 필수입니다.")
    private OffsetDateTime counseledAt;
    
    private Boolean isConfidential = false;
}
