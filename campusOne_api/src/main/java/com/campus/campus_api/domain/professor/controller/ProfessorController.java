package com.campus.campus_api.domain.professor.controller;

import com.campus.campus_api.domain.course.dto.CourseListResponse;
import com.campus.campus_api.domain.professor.dto.*;
import com.campus.campus_api.domain.professor.service.ProfessorService;
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

@RestController
@RequestMapping("/api/professors")
@RequiredArgsConstructor
public class ProfessorController {

    private final ProfessorService professorService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Page<ProfessorResponse>>> getProfessors(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.ok(professorService.getProfessors(keyword, departmentId, status, pageable)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ProfessorResponse>> createProfessor(
            @Valid @RequestBody ProfessorCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(professorService.createProfessor(request), "교수가 등록되었습니다."));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ProfessorResponse>> getProfessor(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(professorService.getProfessor(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ProfessorResponse>> updateProfessor(
            @PathVariable Long id,
            @Valid @RequestBody ProfessorUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(professorService.updateProfessor(id, request), "교수 정보가 수정되었습니다."));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> updateProfessorStatus(
            @PathVariable Long id,
            @Valid @RequestBody ProfessorStatusRequest request) {
        professorService.updateProfessorStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok(null, "상태가 변경되었습니다."));
    }

    @GetMapping("/{id}/courses")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<CourseListResponse>>> getProfessorCourses(
            @PathVariable Long id,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return ResponseEntity.ok(ApiResponse.ok(professorService.getProfessorCourses(id, year, semester, pageable)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<ApiResponse<ProfessorResponse>> getMyInfo(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(professorService.getMyInfo(user.getId())));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<ApiResponse<Void>> updateMyInfo(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ProfessorMeUpdateRequest request) {
        professorService.updateMyInfo(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok(null, "본인 정보가 수정되었습니다."));
    }
}
