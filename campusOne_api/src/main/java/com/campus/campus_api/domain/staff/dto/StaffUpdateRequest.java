package com.campus.campus_api.domain.staff.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class StaffUpdateRequest {
    private String phone;
    @NotNull
    private Long officeId;
    private String employmentType;
}
