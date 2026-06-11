package com.campus.campus_api.domain.exam.dto;

import com.campus.campus_api.domain.exam.entity.ExamRegistration;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
public class MyExamScheduleResponse {
    private Long examId;
    private Long courseId;
    private String courseName;
    private String examType;
    private String title;
    private LocalDate examDate;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String room;
    private String myStatus;

    public static MyExamScheduleResponse from(ExamRegistration registration) {
        if (registration == null) return null;
        return MyExamScheduleResponse.builder()
                .examId(registration.getExam().getId())
                .courseId(registration.getExam().getCourse().getId())
                .courseName(registration.getExam().getCourse().getName())
                .examType(registration.getExam().getExamType())
                .title(registration.getExam().getTitle())
                .examDate(registration.getExam().getExamDate())
                .startTime(registration.getExam().getStartTime())
                .endTime(registration.getExam().getEndTime())
                .room(registration.getExam().getRoom())
                .myStatus(registration.getStatus())
                .build();
    }
}
