package com.campus.campus_api.domain.notice.dto;

import com.campus.campus_api.domain.notice.entity.Notice;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class NoticeDetailResponse {

    private Long id;
    private String title;
    private String content;
    private String category;
    private String authorName;
    private String departmentName;
    private Boolean isPinned;
    private Long viewCount;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static NoticeDetailResponse from(Notice notice) {
        return NoticeDetailResponse.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .category(notice.getCategory())
                .authorName(notice.getAuthor().getName())
                .departmentName(notice.getDepartment() != null ? notice.getDepartment().getName() : null)
                .isPinned(notice.getIsPinned())
                .viewCount(notice.getViewCount())
                .createdAt(notice.getCreatedAt())
                .updatedAt(notice.getUpdatedAt())
                .build();
    }
}
