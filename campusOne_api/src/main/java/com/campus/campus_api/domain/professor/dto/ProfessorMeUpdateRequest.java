package com.campus.campus_api.domain.professor.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProfessorMeUpdateRequest {
    private String phone;
    private String researchField;
    private String officeLocation;
    private String officePhone;
}
