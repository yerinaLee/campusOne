package com.campus.campus_api.domain.grade.controller;

import com.campus.campus_api.domain.grade.dto.GradeResponse;
import com.campus.campus_api.domain.grade.dto.GradeSubmitRequest;
import com.campus.campus_api.domain.grade.dto.GradeUpdateRequest;
import com.campus.campus_api.domain.grade.service.GradeService;
import com.campus.campus_api.domain.user.entity.User;
import com.campus.campus_api.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    // 학생: 내 성적 목록
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<GradeResponse>>> getMyGrades(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(gradeService.getMyGrades(user)));
    }

    // 교수: 강의별 성적 목록
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<ApiResponse<List<GradeResponse>>> getGradesByCourse(
            @AuthenticationPrincipal User user,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.ok(gradeService.getGradesByCourse(user, courseId)));
    }

    // 교수: 성적 입력
    @PostMapping
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<ApiResponse<GradeResponse>> submitGrade(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody GradeSubmitRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(gradeService.submitGrade(user, request)));
    }

    // 교수: 성적 수정
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROFESSOR')")
    public ResponseEntity<ApiResponse<GradeResponse>> updateGrade(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody GradeUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(gradeService.updateGrade(user, id, request)));
    }
}
