package com.campus.campus_api.domain.college.controller;

import com.campus.campus_api.domain.college.dto.*;
import com.campus.campus_api.domain.college.service.CollegeService;
import com.campus.campus_api.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/colleges")
@RequiredArgsConstructor
public class CollegeController {

    private final CollegeService collegeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CollegeResponse>>> getColleges() {
        return ResponseEntity.ok(ApiResponse.ok(collegeService.getColleges()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<CollegeResponse>> createCollege(
            @Valid @RequestBody CollegeCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(collegeService.createCollege(request), "단과대학이 등록되었습니다."));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<CollegeResponse>> updateCollege(
            @PathVariable Long id,
            @Valid @RequestBody CollegeUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(collegeService.updateCollege(id, request), "단과대학 정보가 수정되었습니다."));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteCollege(@PathVariable Long id) {
        collegeService.deleteCollege(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "단과대학이 삭제되었습니다."));
    }
}
