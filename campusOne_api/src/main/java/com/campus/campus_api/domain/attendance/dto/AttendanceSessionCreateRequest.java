package com.campus.campus_api.domain.attendance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
public class AttendanceSessionCreateRequest {
    @NotNull(message = "강의 ID는 필수입니다.")
    private Long courseId;
    
    @NotNull(message = "강의 일자는 필수입니다.")
    private LocalDate lectureDate;
    
    @NotNull(message = "시작 시간은 필수입니다.")
    private OffsetDateTime startTime;
    
    @NotNull(message = "종료 시간은 필수입니다.")
    private OffsetDateTime endTime;
    
    private OffsetDateTime lateThreshold;
}
