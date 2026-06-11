package com.campus.campus_api.domain.assignment.dto;

import com.campus.campus_api.domain.assignment.entity.AssignmentSubmission;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class AssignmentSubmissionResponse {
    private Long id;
    private Long assignmentId;
    private Long studentId;
    private String studentName;
    private String studentNumber;
    private String content;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String status;
    private BigDecimal score;
    private String feedback;
    private OffsetDateTime submittedAt;
    private OffsetDateTime gradedAt;
    private Long gradedById;

    public static AssignmentSubmissionResponse from(AssignmentSubmission submission) {
        if (submission == null) return null;
        return AssignmentSubmissionResponse.builder()
                .id(submission.getId())
                .assignmentId(submission.getAssignment().getId())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getUser().getName())
                .studentNumber(submission.getStudent().getStudentNumber())
                .content(submission.getContent())
                .fileName(submission.getFileName())
                .filePath(submission.getFilePath())
                .fileSize(submission.getFileSize())
                .status(submission.getStatus())
                .score(submission.getScore())
                .feedback(submission.getFeedback())
                .submittedAt(submission.getSubmittedAt())
                .gradedAt(submission.getGradedAt())
                .gradedById(submission.getGradedBy() != null ? submission.getGradedBy().getId() : null)
                .build();
    }
}
