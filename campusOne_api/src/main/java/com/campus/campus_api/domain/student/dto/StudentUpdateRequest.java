package com.campus.campus_api.domain.student.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class StudentUpdateRequest {
    private String phone;
    private String address;
    @NotNull
    private Long departmentId;
    @NotNull
    private Integer grade;
    @NotNull
    private Integer semester;
}
