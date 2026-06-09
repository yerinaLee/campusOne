package com.campus.campus_api.domain.department.service;

import com.campus.campus_api.domain.college.entity.College;
import com.campus.campus_api.domain.college.repository.CollegeRepository;
import com.campus.campus_api.domain.department.dto.*;
import com.campus.campus_api.domain.department.entity.Department;
import com.campus.campus_api.domain.department.repository.DepartmentRepository;
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
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final CollegeRepository collegeRepository;

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getDepartments(Long collegeId) {
        List<Department> departments;
        if (collegeId != null) {
            departments = departmentRepository.findByCollegeIdAndDeletedAtIsNull(collegeId);
        } else {
            departments = departmentRepository.findByDeletedAtIsNull();
        }
        return departments.stream()
                .map(DepartmentResponse::from)
                .collect(Collectors.toList());
    }

    public DepartmentResponse createDepartment(DepartmentCreateRequest request) {
        College college = collegeRepository.findById(request.getCollegeId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        Department department = Department.builder()
                .code(request.getCode())
                .name(request.getName())
                .college(college)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        departmentRepository.save(department);
        return DepartmentResponse.from(department);
    }

    public DepartmentResponse updateDepartment(Long id, DepartmentUpdateRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        College college = collegeRepository.findById(request.getCollegeId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        department.setName(request.getName());
        department.setCollege(college);
        department.setUpdatedAt(OffsetDateTime.now());

        return DepartmentResponse.from(department);
    }

    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        department.setDeletedAt(OffsetDateTime.now());
        department.setUpdatedAt(OffsetDateTime.now());
    }
}
