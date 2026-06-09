package com.campus.campus_api.domain.grade.dto;

import com.campus.campus_api.domain.grade.entity.Grade;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Builder
public class GradeResponse {

    private Long id;
    private Long enrollmentId;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private String studentName;
    private String studentNumber;
    private Integer credit;
    private String letterGrade;
    private BigDecimal score;
    private BigDecimal gradePoints;
    private Boolean isPassFail;
    private String status;
    private OffsetDateTime submittedAt;

    public static GradeResponse from(Grade grade) {
        var enrollment = grade.getEnrollment();
        var course = enrollment.getCourse();
        var student = enrollment.getStudent();

        return GradeResponse.builder()
                .id(grade.getId())
                .enrollmentId(enrollment.getId())
                .courseId(course.getId())
                .courseCode(course.getCourseCode())
                .courseName(course.getName())
                .studentName(student.getUser().getName())
                .studentNumber(student.getStudentNumber())
                .credit(course.getCredit())
                .letterGrade(grade.getLetterGrade())
                .score(grade.getScore())
                .gradePoints(grade.getGradePoints())
                .isPassFail(grade.getIsPassFail())
                .status(grade.getStatus())
                .submittedAt(grade.getSubmittedAt())
                .build();
    }
}
