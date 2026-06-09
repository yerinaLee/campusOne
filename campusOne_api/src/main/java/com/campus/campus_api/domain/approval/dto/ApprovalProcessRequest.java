package com.campus.campus_api.domain.approval.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ApprovalProcessRequest {
    @NotBlank
    private String action; // APPROVED, REJECTED
    private String comment;
}
