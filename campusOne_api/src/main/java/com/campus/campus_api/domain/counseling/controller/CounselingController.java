package com.campus.campus_api.domain.counseling.controller;

import com.campus.campus_api.domain.counseling.dto.*;
import com.campus.campus_api.domain.counseling.service.CounselingService;
import com.campus.campus_api.domain.user.entity.User;
import com.campus.campus_api.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/counseling")
@RequiredArgsConstructor
public class CounselingController {

    private final CounselingService counselingService;

    @PostMapping("/requests")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<CounselingRequestResponse>> createRequest(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CounselingRequestCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(counselingService.createRequest(user.getId(), request), "상담이 신청되었습니다."));
    }

    @GetMapping("/requests")
    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<CounselingRequestResponse>>> getRequests(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String counselingType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String role = user.getRole().name();
        return ResponseEntity.ok(ApiResponse.ok(counselingService.getRequests(user.getId(), role, studentId, status, counselingType, PageRequest.of(page, size))));
    }

    @PatchMapping("/requests/{id}/accept")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'STAFF')")
    public ResponseEntity<ApiResponse<CounselingRequestResponse>> acceptRequest(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        CounselingRequestProcessRequest req = new CounselingRequestProcessRequest();
        req.setStatus("ACCEPTED");
        return ResponseEntity.ok(ApiResponse.ok(counselingService.processRequest(id, user.getId(), req), "상담 신청을 수락했습니다."));
    }

    @PatchMapping("/requests/{id}/reject")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'STAFF')")
    public ResponseEntity<ApiResponse<CounselingRequestResponse>> rejectRequest(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody CounselingRequestProcessRequest request) {
        request.setStatus("REJECTED");
        return ResponseEntity.ok(ApiResponse.ok(counselingService.processRequest(id, user.getId(), request), "상담 신청을 거절했습니다."));
    }

    @PostMapping("/records")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'STAFF')")
    public ResponseEntity<ApiResponse<CounselingRecordResponse>> createRecord(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CounselingRecordCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(counselingService.createRecord(user.getId(), request), "상담 기록이 저장되었습니다."));
    }

    @GetMapping("/records")
    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<CounselingRecordResponse>>> getRecords(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) String counselingType,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String role = user.getRole().name();
        return ResponseEntity.ok(ApiResponse.ok(counselingService.getRecords(user.getId(), role, studentId, counselingType, from, to, PageRequest.of(page, size))));
    }

    @GetMapping("/records/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<CounselingRecordResponse>> getRecord(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        String role = user.getRole().name();
        return ResponseEntity.ok(ApiResponse.ok(counselingService.getRecord(id, user.getId(), role)));
    }

    @PutMapping("/records/{id}")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'STAFF')")
    public ResponseEntity<ApiResponse<CounselingRecordResponse>> updateRecord(
            @PathVariable Long id,
            @RequestBody CounselingRecordUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(counselingService.updateRecord(id, request), "상담 기록이 수정되었습니다."));
    }

    @PostMapping("/records/{id}/notify")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> notifyStudent(
            @PathVariable Long id) {
        counselingService.notifyStudent(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "이메일이 발송되었습니다."));
    }
}
