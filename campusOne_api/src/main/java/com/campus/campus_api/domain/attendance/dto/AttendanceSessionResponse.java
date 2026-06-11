package com.campus.campus_api.domain.attendance.dto;

import com.campus.campus_api.domain.attendance.entity.AttendanceSession;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
public class AttendanceSessionResponse {
    private Long id;
    private Long courseId;
    private String courseName;
    private String professorName;
    private LocalDate lectureDate;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private OffsetDateTime lateThreshold;
    private String accessCode;
    private String qrToken;
    private String qrUrl;
    private String status;
    private Boolean isActive;
    
    // 현황 관련 필드
    private Long totalEnrolled;
    private Long presentCount;
    private Long lateCount;
    private Long absentCount;

    public static AttendanceSessionResponse from(AttendanceSession session, String baseUrl) {
        return AttendanceSessionResponse.builder()
                .id(session.getId())
                .courseId(session.getCourse().getId())
                .courseName(session.getCourse().getName())
                .professorName(session.getProfessor().getUser().getName())
                .lectureDate(session.getLectureDate())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .lateThreshold(session.getLateThreshold())
                .accessCode(session.getAccessCode())
                .qrToken(session.getQrToken())
                .qrUrl(baseUrl + "/attend/" + session.getQrToken())
                .status(session.getStatus())
                .isActive("ACTIVE".equals(session.getStatus()))
                .build();
    }
}
