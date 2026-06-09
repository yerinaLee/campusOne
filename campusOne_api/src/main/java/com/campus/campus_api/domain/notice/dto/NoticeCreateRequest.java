package com.campus.campus_api.domain.notice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class NoticeCreateRequest {

    @NotBlank(message = "제목을 입력해주세요.")
    private String title;

    @NotBlank(message = "내용을 입력해주세요.")
    private String content;

    @Pattern(regexp = "ACADEMIC|DEPARTMENT|COURSE|GENERAL",
             message = "카테고리는 ACADEMIC, DEPARTMENT, COURSE, GENERAL 중 하나여야 합니다.")
    private String category = "GENERAL";

    private Long departmentId;

    private Long courseId;

    private Boolean isPinned = false;
}
