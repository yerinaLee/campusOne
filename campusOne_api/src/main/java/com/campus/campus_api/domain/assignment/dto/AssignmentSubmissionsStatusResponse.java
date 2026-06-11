package com.campus.campus_api.domain.assignment.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AssignmentSubmissionsStatusResponse {
    private Long assignmentId;
    private String title;
    private Integer submittedCount;
    private Integer lateCount;
    private Integer notSubmittedCount;
    private List<AssignmentSubmissionResponse> submissions;
}
