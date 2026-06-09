package com.campus.campus_api.domain.department.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class DepartmentCreateRequest {
    @NotBlank
    private String code;
    @NotBlank
    private String name;
    @NotNull
    private Long collegeId;
}
