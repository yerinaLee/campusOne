package com.campus.campus_api.domain.college.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CollegeCreateRequest {
    @NotBlank
    private String code;
    @NotBlank
    private String name;
}
