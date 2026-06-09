package com.campus.campus_api.domain.staff.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class StaffCreateRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String email;
    private String phone;
    @NotBlank
    private String password;
    @NotNull
    private Long officeId;
    @NotBlank
    private String employmentType;
    @NotNull
    private LocalDate hireDate;
    private LocalDate birthDate;
    private String address;
    private String emergencyContact;
}
