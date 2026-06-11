package com.campus.campus_api.domain.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
public class ExamCreateRequest {
    @NotNull(message = "강의 ID는 필수입니다.")
    private Long courseId;

    @NotBlank(message = "시험 유형은 필수입니다.")
    private String examType;

    @NotBlank(message = "시험 제목은 필수입니다.")
    private String title;

    @NotNull(message = "시험 날짜는 필수입니다.")
    private LocalDate examDate;

    @NotNull(message = "시작 시간은 필수입니다.")
    private OffsetDateTime startTime;

    @NotNull(message = "종료 시간은 필수입니다.")
    private OffsetDateTime endTime;

    private String room;
    private Integer maxStudents;
    private String description;
}
