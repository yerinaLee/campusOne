package com.campus.campus_api.domain.course.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class CourseUpdateRequest {
    @NotBlank
    private String name;
    @NotNull
    private Integer credit;
    @NotNull
    private Integer maxEnrollment;
    private String classroom;
    private String description;
    
    private List<CourseCreateRequest.ScheduleRequest> schedules;
}
