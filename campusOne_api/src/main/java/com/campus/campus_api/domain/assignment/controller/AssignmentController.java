package com.campus.campus_api.domain.assignment.controller;

import com.campus.campus_api.domain.assignment.dto.*;
import com.campus.campus_api.domain.assignment.service.AssignmentService;
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

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> createAssignment(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AssignmentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(assignmentService.createAssignment(user.getId(), request), "과제가 개설되었습니다."));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignments(
            @AuthenticationPrincipal User user,
            @RequestParam Long courseId,
            @RequestParam(required = false) String status) {
        String role = user.getRole().name();
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.getAssignments(user.getId(), role, courseId, status)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.getAssignment(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> updateAssignment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody AssignmentCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.updateAssignment(id, user.getId(), request), "과제가 수정되었습니다."));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        assignmentService.deleteAssignment(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok(null, "과제가 삭제되었습니다."));
    }

    @PostMapping("/{id}/submissions")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AssignmentSubmissionResponse>> submitAssignment(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody AssignmentSubmitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(assignmentService.submitAssignment(id, user.getId(), request), "과제가 제출되었습니다."));
    }

    @GetMapping("/{id}/submissions")
    @PreAuthorize("hasAnyRole('PROFESSOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<AssignmentSubmissionsStatusResponse>> getSubmissionsStatus(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.getSubmissionsStatus(id)));
    }

    @PostMapping("/{id}/submissions/{studentId}/grade")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<ApiResponse<AssignmentSubmissionResponse>> gradeSubmission(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @PathVariable Long studentId,
            @Valid @RequestBody AssignmentGradeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.gradeSubmission(id, studentId, user.getId(), request), "과제 채점이 완료되었습니다."));
    }
}
