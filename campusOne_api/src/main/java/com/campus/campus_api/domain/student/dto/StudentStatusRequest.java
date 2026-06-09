package com.campus.campus_api.domain.student.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class StudentStatusRequest {
    @NotBlank
    private String status;
    private String reason;
}
