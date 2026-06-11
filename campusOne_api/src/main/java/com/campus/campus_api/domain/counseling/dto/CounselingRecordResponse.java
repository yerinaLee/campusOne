package com.campus.campus_api.domain.counseling.dto;

import com.campus.campus_api.domain.counseling.entity.CounselingRecord;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class CounselingRecordResponse {
    private Long id;
    private Long requestId;
    private Long studentId;
    private String studentName;
    private String studentNumber;
    private Long counselorId;
    private String counselorName;
    private String counselingType;
    private String subject;
    private String content;
    private String outcome;
    private String followUp;
    private OffsetDateTime counseledAt;
    private Boolean isNotified;
    private Boolean isConfidential;
    private OffsetDateTime createdAt;

    public static CounselingRecordResponse from(CounselingRecord record) {
        return CounselingRecordResponse.builder()
                .id(record.getId())
                .requestId(record.getRequest() != null ? record.getRequest().getId() : null)
                .studentId(record.getStudent().getId())
                .studentName(record.getStudent().getUser().getName())
                .studentNumber(record.getStudent().getStudentNumber())
                .counselorId(record.getCounselor().getId())
                .counselorName(record.getCounselor().getName())
                .counselingType(record.getCounselingType())
                .subject(record.getSubject())
                .content(record.getContent())
                .outcome(record.getOutcome())
                .followUp(record.getFollowUp())
                .counseledAt(record.getCounseledAt())
                .isNotified(record.getIsNotified())
                .isConfidential(record.getIsConfidential())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
