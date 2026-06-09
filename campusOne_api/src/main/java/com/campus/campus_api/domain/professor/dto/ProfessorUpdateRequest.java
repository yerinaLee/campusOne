package com.campus.campus_api.domain.professor.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProfessorUpdateRequest {
    private String phone;
    @NotNull
    private Long departmentId;
    private String position;
    private String researchField;
    private String officeLocation;
    private String officePhone;
}
