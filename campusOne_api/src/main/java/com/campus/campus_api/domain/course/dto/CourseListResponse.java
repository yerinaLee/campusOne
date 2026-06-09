package com.campus.campus_api.domain.course.dto;

import com.campus.campus_api.domain.course.entity.Course;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourseListResponse {
    private Long id;
    private String courseCode;
    private String name;
    private String departmentName;
    private String professorName;
    private Integer credit;
    private Integer year;
    private Integer semester;
    private Integer maxEnrollment;
    private Integer currentEnrollment;
    private String classroom;
    private String courseType;
    private String status;

    public static CourseListResponse from(Course c) {
        return CourseListResponse.builder()
                .id(c.getId())
                .courseCode(c.getCourseCode())
                .name(c.getName())
                .departmentName(c.getDepartment().getName())
                .professorName(c.getProfessor().getUser().getName())
                .credit(c.getCredit())
                .year(c.getYear())
                .semester(c.getSemester())
                .maxEnrollment(c.getMaxEnrollment())
                .currentEnrollment(c.getCurrentEnrollment())
                .classroom(c.getClassroom())
                .courseType(c.getCourseType())
                .status(c.getStatus())
                .build();
    }
}
