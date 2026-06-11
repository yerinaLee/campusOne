package com.campus.campus_api.domain.exam.dto;

import com.campus.campus_api.domain.exam.entity.ExamRegistration;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class ExamRegistrationResponse {
    private Long id;
    private Long studentId;
    private String studentNumber;
    private String studentName;
    private String status;
    private Boolean isSpecial;
    private OffsetDateTime registeredAt;

    public static ExamRegistrationResponse from(ExamRegistration registration) {
        if (registration == null) return null;
        return ExamRegistrationResponse.builder()
                .id(registration.getId())
                .studentId(registration.getStudent().getId())
                .studentNumber(registration.getStudent().getStudentNumber())
                .studentName(registration.getStudent().getUser().getName())
                .status(registration.getStatus())
                .isSpecial(registration.getIsSpecial())
                .registeredAt(registration.getRegisteredAt())
                .build();
    }
}
