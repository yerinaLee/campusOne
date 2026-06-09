package com.campus.campus_api.domain.student.dto;

import com.campus.campus_api.domain.student.entity.Student;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Builder
public class StudentResponse {
    private Long id;
    private Long userId;
    private String studentNumber;
    private String name;
    private String email;
    private String phone;
    private Long departmentId;
    private String departmentName;
    private String collegeName;
    private Integer grade;
    private Integer semester;
    private Integer admissionYear;
    private String status;
    private LocalDate birthDate;
    private String address;
    private OffsetDateTime createdAt;

    public static StudentResponse from(Student student) {
        return StudentResponse.builder()
                .id(student.getId())
                .userId(student.getUser().getId())
                .studentNumber(student.getStudentNumber())
                .name(student.getUser().getName())
                .email(student.getUser().getEmail())
                .phone(student.getUser().getPhone())
                .departmentId(student.getDepartment().getId())
                .departmentName(student.getDepartment().getName())
                .collegeName(student.getDepartment().getCollege() != null ? student.getDepartment().getCollege().getName() : null)
                .grade(student.getGrade())
                .semester(student.getSemester())
                .admissionYear(student.getAdmissionYear())
                .status(student.getStatus())
                .birthDate(student.getBirthDate())
                .address(student.getAddress())
                .createdAt(student.getCreatedAt())
                .build();
    }
}
