package com.campus.campus_api.domain.course.dto;

import com.campus.campus_api.domain.course.entity.Course;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CourseDetailResponse {
    private Long id;
    private String courseCode;
    private String name;
    private Long departmentId;
    private String departmentName;
    private Long professorId;
    private String professorName;
    private Integer credit;
    private Integer year;
    private Integer semester;
    private Integer maxEnrollment;
    private Integer currentEnrollment;
    private String classroom;
    private String courseType;
    private String description;
    private String status;
    private List<CourseScheduleDto> schedules;

    public static CourseDetailResponse from(Course c) {
        return CourseDetailResponse.builder()
                .id(c.getId())
                .courseCode(c.getCourseCode())
                .name(c.getName())
                .departmentId(c.getDepartment().getId())
                .departmentName(c.getDepartment().getName())
                .professorId(c.getProfessor().getId())
                .professorName(c.getProfessor().getUser().getName())
                .credit(c.getCredit())
                .year(c.getYear())
                .semester(c.getSemester())
                .maxEnrollment(c.getMaxEnrollment())
                .currentEnrollment(c.getCurrentEnrollment())
                .classroom(c.getClassroom())
                .courseType(c.getCourseType())
                .description(c.getDescription())
                .status(c.getStatus())
                .schedules(c.getSchedules().stream().map(CourseScheduleDto::from).toList())
                .build();
    }
}
