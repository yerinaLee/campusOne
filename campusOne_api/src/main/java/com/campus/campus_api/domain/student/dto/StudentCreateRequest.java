package com.campus.campus_api.domain.student.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class StudentCreateRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String email;
    private String phone;
    @NotBlank
    private String password;
    @NotNull
    private Long departmentId;
    @NotNull
    private Integer grade;
    @NotNull
    private Integer semester;
    @NotNull
    private Integer admissionYear;
    private LocalDate birthDate;
    private String address;
}
