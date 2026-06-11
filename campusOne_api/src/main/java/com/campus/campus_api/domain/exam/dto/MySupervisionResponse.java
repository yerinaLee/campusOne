package com.campus.campus_api.domain.exam.dto;

import com.campus.campus_api.domain.exam.entity.ExamSupervisor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
public class MySupervisionResponse {
    private Long examId;
    private String courseName;
    private String title;
    private LocalDate examDate;
    private OffsetDateTime startTime;
    private String room;
    private String supervisorRole;

    public static MySupervisionResponse from(ExamSupervisor supervisor) {
        if (supervisor == null) return null;
        return MySupervisionResponse.builder()
                .examId(supervisor.getExam().getId())
                .courseName(supervisor.getExam().getCourse().getName())
                .title(supervisor.getExam().getTitle())
                .examDate(supervisor.getExam().getExamDate())
                .startTime(supervisor.getExam().getStartTime())
                .room(supervisor.getExam().getRoom())
                .supervisorRole(supervisor.getSupervisorRole())
                .build();
    }
}
