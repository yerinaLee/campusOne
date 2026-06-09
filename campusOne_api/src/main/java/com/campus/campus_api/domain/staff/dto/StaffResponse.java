package com.campus.campus_api.domain.staff.dto;

import com.campus.campus_api.domain.staff.entity.StaffMember;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class StaffResponse {
    private Long id;
    private String staffNumber;
    private String name;
    private String email;
    private String phone;
    private Long officeId;
    private String officeName;
    private String employmentType;
    private String status;
    private LocalDate hireDate;
    private LocalDate birthDate;
    private String officePhone;
    private String officeLocation;
    private List<StaffJobResponse> jobs;

    public static StaffResponse from(StaffMember staff) {
        return StaffResponse.builder()
                .id(staff.getId())
                .staffNumber(staff.getStaffNumber())
                .name(staff.getUser().getName())
                .email(staff.getUser().getEmail())
                .phone(staff.getUser().getPhone())
                .officeId(staff.getOffice().getId())
                .officeName(staff.getOffice().getName())
                .employmentType(staff.getEmploymentType())
                .status(staff.getStatus())
                .hireDate(staff.getHireDate())
                .build();
    }
}
