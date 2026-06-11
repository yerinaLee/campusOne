package com.campus.campus_api.domain.attendance.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CourseAttendanceSummaryResponse {
    private Long courseId;
    private String courseName;
    private Long totalSessions;
    private List<StudentAttendanceSummary> students;

    @Data
    @Builder
    public static class StudentAttendanceSummary {
        private Long studentId;
        private String studentNumber;
        private String studentName;
        private Long presentCount;
        private Long lateCount;
        private Long absentCount;
        private Double attendanceRate;
    }
}
