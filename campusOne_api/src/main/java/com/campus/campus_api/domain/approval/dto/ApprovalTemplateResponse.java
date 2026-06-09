package com.campus.campus_api.domain.approval.dto;

import com.campus.campus_api.domain.approval.entity.ApprovalTemplate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApprovalTemplateResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String fieldsSchema;

    public static ApprovalTemplateResponse from(ApprovalTemplate template) {
        return ApprovalTemplateResponse.builder()
                .id(template.getId())
                .code(template.getCode())
                .name(template.getName())
                .description(template.getDescription())
                .fieldsSchema(template.getFieldsSchema())
                .build();
    }
}
