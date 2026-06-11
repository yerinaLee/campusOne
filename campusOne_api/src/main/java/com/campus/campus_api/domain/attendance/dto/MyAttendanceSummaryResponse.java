package com.campus.campus_api.domain.attendance.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MyAttendanceSummaryResponse {
    private Long courseId;
    private String courseName;
    private Long totalSessions;
    private Long presentCount;
    private Long lateCount;
    private Long absentCount;
    private Double attendanceRate;
    private List<AttendanceRecordResponse> records;
}
