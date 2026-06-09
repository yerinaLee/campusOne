package com.campus.campus_api.domain.staff.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class StaffStatusRequest {
    @NotBlank
    private String status;
    private String reason;
    private LocalDate effectiveDate;
}
