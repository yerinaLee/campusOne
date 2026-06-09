package com.campus.campus_api.domain.staff.service;

import com.campus.campus_api.domain.office.entity.AdministrativeOffice;
import com.campus.campus_api.domain.office.entity.JobPosition;
import com.campus.campus_api.domain.office.repository.AdministrativeOfficeRepository;
import com.campus.campus_api.domain.office.repository.JobPositionRepository;
import com.campus.campus_api.domain.staff.dto.*;
import com.campus.campus_api.domain.staff.entity.StaffJob;
import com.campus.campus_api.domain.staff.entity.StaffMember;
import com.campus.campus_api.domain.staff.repository.StaffJobRepository;
import com.campus.campus_api.domain.staff.repository.StaffMemberRepository;
import com.campus.campus_api.domain.user.entity.User;
import com.campus.campus_api.domain.user.entity.UserRole;
import com.campus.campus_api.domain.user.repository.UserRepository;
import com.campus.campus_api.global.exception.CustomException;
import com.campus.campus_api.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class StaffService {

    private final StaffMemberRepository staffMemberRepository;
    private final StaffJobRepository staffJobRepository;
    private final UserRepository userRepository;
    private final AdministrativeOfficeRepository officeRepository;
    private final JobPositionRepository jobPositionRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<StaffResponse> getStaffMembers(String keyword, Long officeId, String status, String employmentType, Pageable pageable) {
        return staffMemberRepository.findAllWithFilters(keyword, officeId, status, employmentType, pageable)
                .map(StaffResponse::from);
    }

    public StaffResponse createStaff(StaffCreateRequest request) {
        AdministrativeOffice office = officeRepository.findById(request.getOfficeId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        long count = staffMemberRepository.count() + 1;
        String staffNumber = "S" + OffsetDateTime.now().getYear() + String.format("%04d", count);

        User user = User.builder()
                .username(staffNumber)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(UserRole.STAFF)
                .isActive(true)
                .loginFailCount(0)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        userRepository.save(user);

        StaffMember staff = StaffMember.builder()
                .user(user)
                .staffNumber(staffNumber)
                .hireDate(request.getHireDate())
                .office(office)
                .employmentType(request.getEmploymentType())
                .status("ACTIVE")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        staffMemberRepository.save(staff);

        return StaffResponse.from(staff);
    }

    @Transactional(readOnly = true)
    public StaffResponse getStaff(Long id) {
        StaffMember staff = staffMemberRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        return StaffResponse.from(staff);
    }

    public StaffResponse updateStaff(Long id, StaffUpdateRequest request) {
        StaffMember staff = staffMemberRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        AdministrativeOffice office = officeRepository.findById(request.getOfficeId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        staff.setOffice(office);
        staff.setEmploymentType(request.getEmploymentType());
        staff.setUpdatedAt(OffsetDateTime.now());

        User user = staff.getUser();
        user.setPhone(request.getPhone());
        user.setUpdatedAt(OffsetDateTime.now());

        return StaffResponse.from(staff);
    }

    public void updateStaffStatus(Long id, StaffStatusRequest request) {
        StaffMember staff = staffMemberRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        staff.setStatus(request.getStatus());
        staff.setUpdatedAt(OffsetDateTime.now());
    }

    public StaffJobResponse addJob(Long id, StaffJobCreateRequest request) {
        StaffMember staff = staffMemberRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        
        AdministrativeOffice office = officeRepository.findById(request.getOfficeId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        
        JobPosition position = jobPositionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        StaffJob job = StaffJob.builder()
                .staffMember(staff)
                .office(office)
                .jobPosition(position)
                .departmentId(request.getDepartmentId())
                .jobTitle(request.getJobTitle() != null ? request.getJobTitle() : "미지정")
                .jobCategory(request.getJobCategory() != null ? request.getJobCategory() : "ETC")
                .isPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false)
                .startDate(request.getStartDate())
                .description(request.getDescription())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        staffJobRepository.save(job);
        return StaffJobResponse.from(job);
    }
}
