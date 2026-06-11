package com.campus.campus_api.domain.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AttendanceManualUpdateRequest {
    @NotBlank(message = "출결 상태는 필수입니다.")
    private String status;
    
    @NotBlank(message = "수동 처리 사유는 필수입니다.")
    private String reason;
}
