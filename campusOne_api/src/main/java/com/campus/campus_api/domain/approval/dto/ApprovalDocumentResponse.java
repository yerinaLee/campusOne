package com.campus.campus_api.domain.approval.dto;

import com.campus.campus_api.domain.approval.entity.ApprovalDocument;
import com.campus.campus_api.domain.approval.entity.ApprovalLine;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class ApprovalDocumentResponse {
    private Long id;
    private Long templateId;
    private String templateName;
    private String title;
    private Long drafterId;
    private String drafterName;
    private String status;
    private Integer currentStep;
    private OffsetDateTime submittedAt;
    private OffsetDateTime completedAt;
    private List<ApprovalLineResponse> approvalLines;

    @Getter
    @Builder
    public static class ApprovalLineResponse {
        private Long id;
        private Integer step;
        private Long approverId;
        private String approverName;
        private String roleLabel;
        private String action;
        private String comment;
        private OffsetDateTime actionAt;

        public static ApprovalLineResponse from(ApprovalLine line) {
            return ApprovalLineResponse.builder()
                    .id(line.getId())
                    .step(line.getStep())
                    .approverId(line.getApprover().getId())
                    .approverName(line.getApprover().getName())
                    .roleLabel(line.getRoleLabel())
                    .action(line.getAction())
                    .comment(line.getComment())
                    .actionAt(line.getActionAt())
                    .build();
        }
    }

    public static ApprovalDocumentResponse from(ApprovalDocument document) {
        return ApprovalDocumentResponse.builder()
                .id(document.getId())
                .templateId(document.getTemplate().getId())
                .templateName(document.getTemplate().getName())
                .title(document.getTitle())
                .drafterId(document.getDrafter().getId())
                .drafterName(document.getDrafter().getName())
                .status(document.getStatus())
                .currentStep(document.getCurrentStep())
                .submittedAt(document.getSubmittedAt())
                .completedAt(document.getCompletedAt())
                .approvalLines(document.getApprovalLines().stream()
                        .map(ApprovalLineResponse::from)
                        .collect(Collectors.toList()))
                .build();
    }
}
