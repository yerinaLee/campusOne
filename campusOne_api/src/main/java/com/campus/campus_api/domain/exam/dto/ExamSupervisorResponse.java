package com.campus.campus_api.domain.exam.dto;

import com.campus.campus_api.domain.exam.entity.ExamSupervisor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExamSupervisorResponse {
    private Long examId;
    private Long supervisorId;
    private String name;
    private String role;

    public static ExamSupervisorResponse from(ExamSupervisor supervisor) {
        if (supervisor == null) return null;
        return ExamSupervisorResponse.builder()
                .examId(supervisor.getExam().getId())
                .supervisorId(supervisor.getSupervisor().getId())
                .name(supervisor.getSupervisor().getName())
                .role(supervisor.getSupervisorRole())
                .build();
    }
}
