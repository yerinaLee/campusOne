package com.campus.campus_api.domain.office.dto;

import com.campus.campus_api.domain.office.entity.JobPosition;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class JobPositionResponse {
    private Long id;
    private String code;
    private String name;
    private Integer gradeLevel;

    public static JobPositionResponse from(JobPosition position) {
        return JobPositionResponse.builder()
                .id(position.getId())
                .code(position.getCode())
                .name(position.getName())
                .gradeLevel(position.getGradeLevel())
                .build();
    }
}
