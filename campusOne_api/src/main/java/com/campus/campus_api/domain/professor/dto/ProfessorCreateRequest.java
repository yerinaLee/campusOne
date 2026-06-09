package com.campus.campus_api.domain.professor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class ProfessorCreateRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String email;
    private String phone;
    @NotBlank
    private String password;
    @NotNull
    private Long departmentId;
    private String position;
    private String researchField;
    private String officeLocation;
    private String officePhone;
    private LocalDate hireDate;
}
