package com.campus.campus_api.domain.notice.controller;

import com.campus.campus_api.domain.notice.dto.NoticeCreateRequest;
import com.campus.campus_api.domain.notice.dto.NoticeDetailResponse;
import com.campus.campus_api.domain.notice.dto.NoticeListResponse;
import com.campus.campus_api.domain.notice.service.NoticeService;
import com.campus.campus_api.domain.user.entity.User;
import com.campus.campus_api.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NoticeListResponse>>> getNotices(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long departmentId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(noticeService.getNotices(category, departmentId, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticeDetailResponse>> getNotice(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(noticeService.getNotice(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','PROFESSOR')")
    public ResponseEntity<ApiResponse<NoticeDetailResponse>> createNotice(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody NoticeCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(noticeService.createNotice(user, request)));
    }
}
