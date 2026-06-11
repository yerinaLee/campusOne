package com.campus.campus_api.domain.counseling.dto;

import lombok.Data;

@Data
public class CounselingRecordUpdateRequest {
    private String subject;
    private String content;
    private String outcome;
    private String followUp;
}
