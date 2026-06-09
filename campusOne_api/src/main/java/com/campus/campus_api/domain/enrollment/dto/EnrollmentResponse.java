package com.campus.campus_api.domain.enrollment.dto;

import com.campus.campus_api.domain.enrollment.entity.Enrollment;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class EnrollmentResponse {
    private Long id;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private String professorName;
    private Integer credit;
    private Integer year;
    private Integer semester;
    private String status;
    private OffsetDateTime enrolledAt;

    public static EnrollmentResponse from(Enrollment e) {
        return EnrollmentResponse.builder()
                .id(e.getId())
                .courseId(e.getCourse().getId())
                .courseCode(e.getCourse().getCourseCode())
                .courseName(e.getCourse().getName())
                .professorName(e.getCourse().getProfessor().getUser().getName())
                .credit(e.getCourse().getCredit())
                .year(e.getYear())
                .semester(e.getSemester())
                .status(e.getStatus())
                .enrolledAt(e.getEnrolledAt())
                .build();
    }
}
