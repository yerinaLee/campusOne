package com.campus.campus_api.domain.approval.controller;

import com.campus.campus_api.domain.approval.dto.*;
import com.campus.campus_api.domain.approval.service.ApprovalService;
import com.campus.campus_api.domain.user.entity.User;
import com.campus.campus_api.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping("/templates")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<List<ApprovalTemplateResponse>>> getTemplates() {
        return ResponseEntity.ok(ApiResponse.ok(approvalService.getTemplates()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<Page<ApprovalDocumentResponse>>> getDocuments(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "SENT") String type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.ok(approvalService.getDocuments(user.getId(), type, status, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<ApprovalDocumentResponse>> getDocument(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(approvalService.getDocument(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<ApprovalDocumentResponse>> createDocument(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ApprovalDocumentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(approvalService.createDocument(user.getId(), request), "기안이 상신되었습니다."));
    }

    @PostMapping("/{id}/process")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<Void>> processDocument(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody ApprovalProcessRequest request) {
        approvalService.processDocument(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok(null, "결재가 처리되었습니다."));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'PROFESSOR')")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        approvalService.deleteDocument(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok(null, "결재 문서가 삭제되었습니다."));
    }
}
