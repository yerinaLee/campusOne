package com.campus.campus_api.domain.staff.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class StaffJobCreateRequest {
    @NotNull
    private Long officeId;
    @NotNull
    private Long positionId;
    private Long departmentId;
    private String jobTitle;
    private String jobCategory;
    private Boolean isPrimary;
    @NotNull
    private LocalDate startDate;
    private String description;
}
