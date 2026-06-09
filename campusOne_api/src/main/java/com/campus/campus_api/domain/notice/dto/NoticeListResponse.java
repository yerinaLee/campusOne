package com.campus.campus_api.domain.notice.dto;

import com.campus.campus_api.domain.notice.entity.Notice;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@Builder
public class NoticeListResponse {

    private Long id;
    private String title;
    private String category;
    private String authorName;
    private String departmentName;
    private Boolean isPinned;
    private Long viewCount;
    private OffsetDateTime createdAt;

    public static NoticeListResponse from(Notice notice) {
        return NoticeListResponse.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .category(notice.getCategory())
                .authorName(notice.getAuthor().getName())
                .departmentName(notice.getDepartment() != null ? notice.getDepartment().getName() : null)
                .isPinned(notice.getIsPinned())
                .viewCount(notice.getViewCount())
                .createdAt(notice.getCreatedAt())
                .build();
    }
}
