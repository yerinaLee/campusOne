package com.campus.campus_api.domain.assignment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class AssignmentCreateRequest {
    @NotNull(message = "강의 ID는 필수입니다.")
    private Long courseId;
    
    @NotBlank(message = "과제 제목은 필수입니다.")
    private String title;
    
    private String description;
    
    @NotNull(message = "마감일은 필수입니다.")
    private OffsetDateTime dueDate;
    
    private BigDecimal maxScore = new BigDecimal("100.00");
    private Boolean allowLateSubmit = false;
    private Boolean isVisible = true;
    private String submissionType = "FILE";
}
