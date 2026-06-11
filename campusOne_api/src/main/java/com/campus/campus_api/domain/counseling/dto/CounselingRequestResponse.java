package com.campus.campus_api.domain.counseling.dto;

import com.campus.campus_api.domain.counseling.entity.CounselingRequest;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
public class CounselingRequestResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentNumber;
    private Long counselorId;
    private String counselorName;
    private String counselingType;
    private LocalDate preferredDate;
    private String reason;
    private String status;
    private String rejectReason;
    private OffsetDateTime createdAt;

    public static CounselingRequestResponse from(CounselingRequest request) {
        return CounselingRequestResponse.builder()
                .id(request.getId())
                .studentId(request.getStudent().getId())
                .studentName(request.getStudent().getUser().getName())
                .studentNumber(request.getStudent().getStudentNumber())
                .counselorId(request.getCounselor() != null ? request.getCounselor().getId() : null)
                .counselorName(request.getCounselor() != null ? request.getCounselor().getName() : null)
                .counselingType(request.getCounselingType())
                .preferredDate(request.getPreferredDate())
                .reason(request.getReason())
                .status(request.getStatus())
                .rejectReason(request.getRejectReason())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
