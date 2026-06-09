package com.campus.campus_api.domain.office.controller;

import com.campus.campus_api.domain.office.dto.JobPositionResponse;
import com.campus.campus_api.domain.office.service.OfficeService;
import com.campus.campus_api.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/job-positions")
@RequiredArgsConstructor
public class JobPositionController {

    private final OfficeService officeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<JobPositionResponse>>> getJobPositions() {
        return ResponseEntity.ok(ApiResponse.ok(officeService.getJobPositions()));
    }
}
