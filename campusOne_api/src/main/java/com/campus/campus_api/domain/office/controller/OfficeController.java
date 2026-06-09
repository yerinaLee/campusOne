package com.campus.campus_api.domain.office.controller;

import com.campus.campus_api.domain.office.dto.*;
import com.campus.campus_api.domain.office.service.OfficeService;
import com.campus.campus_api.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offices")
@RequiredArgsConstructor
public class OfficeController {

    private final OfficeService officeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<OfficeResponse>>> getOffices() {
        return ResponseEntity.ok(ApiResponse.ok(officeService.getOffices()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OfficeResponse>> createOffice(
            @Valid @RequestBody OfficeCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(officeService.createOffice(request), "행정 부서가 등록되었습니다."));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OfficeResponse>> updateOffice(
            @PathVariable Long id,
            @Valid @RequestBody OfficeUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(officeService.updateOffice(id, request), "행정 부서 정보가 수정되었습니다."));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteOffice(@PathVariable Long id) {
        officeService.deleteOffice(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "행정 부서가 삭제되었습니다."));
    }
}
