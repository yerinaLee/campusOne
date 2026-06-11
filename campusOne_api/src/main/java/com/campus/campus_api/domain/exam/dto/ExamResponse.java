package com.campus.campus_api.domain.exam.dto;

import com.campus.campus_api.domain.exam.entity.Exam;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class ExamResponse {
    private Long id;
    private Long courseId;
    private String courseName;
    private String professorName;
    private String examType;
    private String title;
    private LocalDate examDate;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String room;
    private Integer maxStudents;
    private String status;
    private String description;
    private List<ExamSupervisorResponse> supervisors;

    public static ExamResponse from(Exam exam, List<ExamSupervisorResponse> supervisors) {
        if (exam == null) return null;
        return ExamResponse.builder()
                .id(exam.getId())
                .courseId(exam.getCourse().getId())
                .courseName(exam.getCourse().getName())
                .professorName(exam.getProfessor().getUser().getName())
                .examType(exam.getExamType())
                .title(exam.getTitle())
                .examDate(exam.getExamDate())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .room(exam.getRoom())
                .maxStudents(exam.getMaxStudents())
                .status(exam.getStatus())
                .description(exam.getDescription())
                .supervisors(supervisors)
                .build();
    }
}
