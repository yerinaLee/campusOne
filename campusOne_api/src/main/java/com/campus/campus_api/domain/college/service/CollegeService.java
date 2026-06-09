package com.campus.campus_api.domain.college.service;

import com.campus.campus_api.domain.college.dto.*;
import com.campus.campus_api.domain.college.entity.College;
import com.campus.campus_api.domain.college.repository.CollegeRepository;
import com.campus.campus_api.global.exception.CustomException;
import com.campus.campus_api.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CollegeService {

    private final CollegeRepository collegeRepository;

    @Transactional(readOnly = true)
    public List<CollegeResponse> getColleges() {
        return collegeRepository.findAll().stream()
                .filter(c -> c.getDeletedAt() == null)
                .map(CollegeResponse::from)
                .collect(Collectors.toList());
    }

    public CollegeResponse createCollege(CollegeCreateRequest request) {
        College college = College.builder()
                .code(request.getCode())
                .name(request.getName())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
        
        collegeRepository.save(college);
        return CollegeResponse.from(college);
    }

    public CollegeResponse updateCollege(Long id, CollegeUpdateRequest request) {
        College college = collegeRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        college.setName(request.getName());
        college.setUpdatedAt(OffsetDateTime.now());

        return CollegeResponse.from(college);
    }

    public void deleteCollege(Long id) {
        College college = collegeRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        college.setDeletedAt(OffsetDateTime.now());
        college.setUpdatedAt(OffsetDateTime.now());
    }
}
