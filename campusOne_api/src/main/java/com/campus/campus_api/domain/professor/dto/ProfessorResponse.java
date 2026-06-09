package com.campus.campus_api.domain.professor.dto;

import com.campus.campus_api.domain.professor.entity.Professor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Builder
public class ProfessorResponse {
    private Long id;
    private String professorNumber;
    private String name;
    private String email;
    private String phone;
    private Long departmentId;
    private String departmentName;
    private String position;
    private String researchField;
    private String officeLocation;
    private String officePhone;
    private LocalDate hireDate;
    private String status;

    public static ProfessorResponse from(Professor professor) {
        return ProfessorResponse.builder()
                .id(professor.getId())
                .professorNumber(professor.getProfessorNumber())
                .name(professor.getUser().getName())
                .email(professor.getUser().getEmail())
                .phone(professor.getUser().getPhone())
                .departmentId(professor.getDepartment().getId())
                .departmentName(professor.getDepartment().getName())
                .position(professor.getPosition())
                .researchField(professor.getResearchField())
                .officeLocation(professor.getOfficeLocation())
                .officePhone(professor.getOfficePhone())
                .hireDate(professor.getHireDate())
                .status(professor.getStatus())
                .build();
    }
}
