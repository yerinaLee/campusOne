package com.campus.campus_api.domain.attendance.controller;

import com.campus.campus_api.domain.attendance.dto.*;
import com.campus.campus_api.domain.attendance.service.AttendanceService;
import com.campus.campus_api.domain.user.entity.User;
import com.campus.campus_api.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/attendance/sessions")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<ApiResponse<AttendanceSessionResponse>> createSession(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AttendanceSessionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(attendanceService.createSession(user.getId(), request), "출결 세션이 생성되었습니다."));
    }

    @GetMapping("/attendance/sessions/{id}")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<AttendanceSessionResponse>> getSession(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getSession(id)));
    }

    @PatchMapping("/attendance/sessions/{id}/close")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<ApiResponse<Void>> closeSession(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        attendanceService.closeSession(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok(null, "출결 세션이 종료되었습니다."));
    }

    @PostMapping("/attendance/sessions/{id}/regenerate-code")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<ApiResponse<Map<String, String>>> regenerateCode(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.regenerateCode(id, user.getId()), "코드가 재생성되었습니다."));
    }

    @GetMapping("/attendance/sessions/{id}/records")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> getRecordsBySession(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getRecordsBySession(id)));
    }

    @PutMapping("/attendance/records/{recordId}")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> updateRecordManual(
            @AuthenticationPrincipal User user,
            @PathVariable Long recordId,
            @Valid @RequestBody AttendanceManualUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.updateRecordManual(recordId, user.getId(), request), "출결이 수정되었습니다."));
    }

    @GetMapping("/courses/{courseId}/attendance/summary")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<CourseAttendanceSummaryResponse>> getCourseAttendanceSummary(
            @PathVariable Long courseId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getCourseAttendanceSummary(courseId, year, semester)));
    }

    @GetMapping("/attendance/qr/{qrToken}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<AttendanceSessionResponse>> getQrSession(
            @PathVariable String qrToken) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getQrSession(qrToken)));
    }

    @PostMapping("/attendance/check-in")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> checkIn(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AttendanceCheckInRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(attendanceService.checkIn(user.getId(), request), "출석이 확인되었습니다."));
    }

    @GetMapping("/attendance/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<MyAttendanceSummaryResponse>>> getMyAttendance(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getMyAttendance(user.getId(), courseId, year, semester)));
    }
}
