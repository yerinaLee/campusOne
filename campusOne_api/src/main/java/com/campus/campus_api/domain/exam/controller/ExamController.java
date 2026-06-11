package com.campus.campus_api.domain.exam.controller;

import com.campus.campus_api.domain.exam.dto.*;
import com.campus.campus_api.domain.exam.service.ExamService;
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

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @PostMapping
    @PreAuthorize("hasAnyRole('PROFESSOR', 'STAFF')")
    public ResponseEntity<ApiResponse<ExamResponse>> createExam(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ExamCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(examService.createExam(user.getId(), request), "시험이 등록되었습니다."));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<ExamResponse>>> getExams(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String examType,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(examService.getExams(courseId, examType, from, to, status, PageRequest.of(page, size))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamResponse>> getExam(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(examService.getExam(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'STAFF')")
    public ResponseEntity<ApiResponse<ExamResponse>> updateExam(
            @PathVariable Long id,
            @RequestBody ExamCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(examService.updateExam(id, request), "시험이 수정되었습니다."));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "시험이 취소되었습니다."));
    }

    @PostMapping("/{id}/supervisors")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamSupervisorResponse>> assignSupervisor(
            @PathVariable Long id,
            @Valid @RequestBody ExamSupervisorAssignRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(examService.assignSupervisor(id, request), "감독관이 배정되었습니다."));
    }

    @DeleteMapping("/{id}/supervisors/{userId}")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeSupervisor(
            @PathVariable Long id,
            @PathVariable Long userId) {
        examService.removeSupervisor(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "감독관이 제거되었습니다."));
    }

    @PostMapping("/{id}/registrations")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ExamRegistrationResponse>> registerExam(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody ExamRegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(examService.registerExam(id, user.getId(), request), "특별 시험 신청이 완료되었습니다."));
    }

    @GetMapping("/{id}/registrations")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ExamRegistrationResponse>>> getRegistrations(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(examService.getRegistrations(id)));
    }

    @PatchMapping("/{id}/registrations/{studentId}/status")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'STAFF')")
    public ResponseEntity<ApiResponse<ExamRegistrationResponse>> updateRegistrationStatus(
            @PathVariable Long id,
            @PathVariable Long studentId,
            @RequestBody ExamStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(examService.updateRegistrationStatus(id, studentId, request), "응시 상태가 변경되었습니다."));
    }

    @GetMapping("/my-schedule")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<MyExamScheduleResponse>>> getMySchedule(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(examService.getMySchedule(user.getId())));
    }

    @GetMapping("/my-supervision")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'STAFF')")
    public ResponseEntity<ApiResponse<List<MySupervisionResponse>>> getMySupervision(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(examService.getMySupervision(user.getId())));
    }
}
