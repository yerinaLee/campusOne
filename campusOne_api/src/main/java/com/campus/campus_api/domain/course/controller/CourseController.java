package com.campus.campus_api.domain.course.controller;

import com.campus.campus_api.domain.course.dto.CourseCreateRequest;
import com.campus.campus_api.domain.course.dto.CourseDetailResponse;
import com.campus.campus_api.domain.course.dto.CourseListResponse;
import com.campus.campus_api.domain.course.dto.CourseUpdateRequest;
import com.campus.campus_api.domain.course.service.CourseService;
import com.campus.campus_api.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ApiResponse<Page<CourseListResponse>> getCourses(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return ApiResponse.ok(courseService.getCourses(year, semester, departmentId, keyword, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<CourseDetailResponse> getCourse(@PathVariable Long id) {
        return ApiResponse.ok(courseService.getCourse(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<CourseDetailResponse>> createCourse(
            @Valid @RequestBody CourseCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(courseService.createCourse(request), "강의가 개설되었습니다."));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<CourseDetailResponse>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.updateCourse(id, request), "강의 정보가 수정되었습니다."));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "강의가 폐강되었습니다."));
    }
}
