package com.campus.campus_api.domain.approval.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ApprovalDocumentCreateRequest {
    @NotNull
    private Long templateId;
    @NotBlank
    private String title;
    @NotBlank
    private String content;
    private String formData;

    @NotEmpty
    private List<ApprovalLineRequest> approvalLines;

    @Getter
    @NoArgsConstructor
    public static class ApprovalLineRequest {
        @NotNull
        private Integer step;
        @NotNull
        private Long approverId;
        @NotBlank
        private String roleLabel;
    }
}
