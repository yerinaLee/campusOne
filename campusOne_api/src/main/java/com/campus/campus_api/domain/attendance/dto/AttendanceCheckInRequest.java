package com.campus.campus_api.domain.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AttendanceCheckInRequest {
    @NotBlank(message = "QR 토큰은 필수입니다.")
    private String qrToken;
    
    @NotBlank(message = "접속 코드는 필수입니다.")
    private String accessCode;
    
    private BigDecimal latitude;
    private BigDecimal longitude;
}
