package com.campus.campus_api.domain.course.dto;

import com.campus.campus_api.domain.course.entity.CourseSchedule;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourseScheduleDto {
    private Long id;
    private Integer dayOfWeek;
    private Integer periodStart;
    private Integer periodEnd;
    private String classroom;

    public static CourseScheduleDto from(CourseSchedule s) {
        return CourseScheduleDto.builder()
                .id(s.getId())
                .dayOfWeek(s.getDayOfWeek())
                .periodStart(s.getPeriodStart())
                .periodEnd(s.getPeriodEnd())
                .classroom(s.getClassroom())
                .build();
    }
}
