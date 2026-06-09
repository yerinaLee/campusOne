package com.campus.campus_api.domain.office.service;

import com.campus.campus_api.domain.office.dto.*;
import com.campus.campus_api.domain.office.entity.AdministrativeOffice;
import com.campus.campus_api.domain.office.repository.AdministrativeOfficeRepository;
import com.campus.campus_api.domain.office.repository.JobPositionRepository;
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
public class OfficeService {

    private final AdministrativeOfficeRepository officeRepository;
    private final JobPositionRepository jobPositionRepository;

    @Transactional(readOnly = true)
    public List<OfficeResponse> getOffices() {
        return officeRepository.findAllRootOffices().stream()
                .map(OfficeResponse::from)
                .collect(Collectors.toList());
    }

    public OfficeResponse createOffice(OfficeCreateRequest request) {
        AdministrativeOffice parent = null;
        if (request.getParentId() != null) {
            parent = officeRepository.findById(request.getParentId())
                    .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        }

        AdministrativeOffice office = AdministrativeOffice.builder()
                .code(request.getCode())
                .name(request.getName())
                .officeType(request.getOfficeType())
                .parent(parent)
                .location(request.getLocation())
                .phone(request.getPhone())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        officeRepository.save(office);
        return OfficeResponse.from(office);
    }

    public OfficeResponse updateOffice(Long id, OfficeUpdateRequest request) {
        AdministrativeOffice office = officeRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        AdministrativeOffice parent = null;
        if (request.getParentId() != null) {
            parent = officeRepository.findById(request.getParentId())
                    .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        }

        office.setName(request.getName());
        office.setParent(parent);
        office.setLocation(request.getLocation());
        office.setPhone(request.getPhone());
        office.setUpdatedAt(OffsetDateTime.now());

        return OfficeResponse.from(office);
    }

    public void deleteOffice(Long id) {
        AdministrativeOffice office = officeRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        
        office.setDeletedAt(OffsetDateTime.now());
        office.setUpdatedAt(OffsetDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<JobPositionResponse> getJobPositions() {
        return jobPositionRepository.findByIsActiveTrueOrderByGradeLevelAsc().stream()
                .map(JobPositionResponse::from)
                .collect(Collectors.toList());
    }
}
