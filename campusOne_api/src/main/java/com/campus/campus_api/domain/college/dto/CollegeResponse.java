package com.campus.campus_api.domain.college.dto;

import com.campus.campus_api.domain.college.entity.College;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CollegeResponse {
    private Long id;
    private String code;
    private String name;

    public static CollegeResponse from(College college) {
        return CollegeResponse.builder()
                .id(college.getId())
                .code(college.getCode())
                .name(college.getName())
                .build();
    }
}
