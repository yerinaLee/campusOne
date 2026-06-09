package com.campus.campus_api.domain.enrollment.controller;

import com.campus.campus_api.domain.enrollment.dto.EnrollRequest;
import com.campus.campus_api.domain.enrollment.dto.EnrollmentResponse;
import com.campus.campus_api.domain.enrollment.service.EnrollmentService;
import com.campus.campus_api.domain.user.entity.User;
import com.campus.campus_api.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<List<EnrollmentResponse>> getMyEnrollments(
            @AuthenticationPrincipal User user) {
        return ApiResponse.ok(enrollmentService.getMyEnrollments(user));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<EnrollmentResponse> enroll(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody EnrollRequest request) {
        return ApiResponse.ok(enrollmentService.enroll(user, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('STUDENT')")
    public void withdraw(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        enrollmentService.withdraw(user, id);
    }
}
