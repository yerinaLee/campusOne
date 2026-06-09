package com.campus.campus_api.domain.approval.dto;

import com.campus.campus_api.domain.approval.entity.ApprovalNotification;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class ApprovalNotificationResponse {
    private Long id;
    private Long documentId;
    private String message;
    private Boolean isRead;
    private OffsetDateTime createdAt;

    public static ApprovalNotificationResponse from(ApprovalNotification notification) {
        return ApprovalNotificationResponse.builder()
                .id(notification.getId())
                .documentId(notification.getDocument().getId())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
