package com.campus.campus_api.domain.course.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class CourseCreateRequest {
    @NotBlank
    private String name;
    @NotNull
    private Long departmentId;
    @NotNull
    private Long professorId;
    @NotNull
    private Integer credit;
    @NotNull
    private Integer year;
    @NotNull
    private Integer semester;
    @NotNull
    private Integer maxEnrollment;
    private String classroom;
    @NotBlank
    private String courseType;
    private String description;
    
    private List<ScheduleRequest> schedules;

    @Getter
    @NoArgsConstructor
    public static class ScheduleRequest {
        @NotNull
        private Integer dayOfWeek;
        @NotNull
        private Integer periodStart;
        @NotNull
        private Integer periodEnd;
        private String classroom;
    }
}
