package com.campus.campus_api.domain.assignment.dto;

import com.campus.campus_api.domain.assignment.entity.Assignment;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class AssignmentResponse {
    private Long id;
    private Long courseId;
    private String courseName;
    private String title;
    private String description;
    private OffsetDateTime dueDate;
    private BigDecimal maxScore;
    private String submissionType;
    private Boolean allowLateSubmit;
    private String status;
    private Integer submittedCount;
    private Integer totalEnrolled;
    private AssignmentSubmissionResponse mySubmission;

    public static AssignmentResponse from(Assignment assignment, Integer submittedCount, Integer totalEnrolled, AssignmentSubmissionResponse mySubmission) {
        return AssignmentResponse.builder()
                .id(assignment.getId())
                .courseId(assignment.getCourse().getId())
                .courseName(assignment.getCourse().getName())
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .dueDate(assignment.getDueDate())
                .maxScore(assignment.getMaxScore())
                .submissionType(assignment.getSubmissionType())
                .allowLateSubmit(assignment.getAllowLateSubmit())
                .status(assignment.getStatus())
                .submittedCount(submittedCount)
                .totalEnrolled(totalEnrolled)
                .mySubmission(mySubmission)
                .build();
    }
}
