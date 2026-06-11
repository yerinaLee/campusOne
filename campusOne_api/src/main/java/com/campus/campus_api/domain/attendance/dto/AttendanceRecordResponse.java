package com.campus.campus_api.domain.attendance.dto;

import com.campus.campus_api.domain.attendance.entity.AttendanceRecord;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
public class AttendanceRecordResponse {
    private Long id;
    private Long sessionId;
    private Long studentId;
    private String studentNumber;
    private String studentName;
    private LocalDate lectureDate;
    private String status;
    private OffsetDateTime checkedInAt;
    private Boolean isManual;
    private String manualReason;

    public static AttendanceRecordResponse from(AttendanceRecord record) {
        return AttendanceRecordResponse.builder()
                .id(record.getId())
                .sessionId(record.getSession().getId())
                .studentId(record.getStudent().getId())
                .studentNumber(record.getStudent().getStudentNumber())
                .studentName(record.getStudent().getUser().getName())
                .lectureDate(record.getSession().getLectureDate())
                .status(record.getStatus())
                .checkedInAt(record.getCheckedInAt())
                .isManual(record.getIsManual())
                .manualReason(record.getManualReason())
                .build();
    }
}
