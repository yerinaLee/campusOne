package com.campus.campus_api.domain.professor.service;

import com.campus.campus_api.domain.course.dto.CourseListResponse;
import com.campus.campus_api.domain.course.repository.CourseRepository;
import com.campus.campus_api.domain.department.entity.Department;
import com.campus.campus_api.domain.department.repository.DepartmentRepository;
import com.campus.campus_api.domain.professor.dto.*;
import com.campus.campus_api.domain.professor.entity.Professor;
import com.campus.campus_api.domain.professor.repository.ProfessorRepository;
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
public class ProfessorService {

    private final ProfessorRepository professorRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<ProfessorResponse> getProfessors(String keyword, Long departmentId, String status, Pageable pageable) {
        return professorRepository.findAllWithFilters(keyword, departmentId, status, pageable)
                .map(ProfessorResponse::from);
    }

    public ProfessorResponse createProfessor(ProfessorCreateRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        long count = professorRepository.count() + 1;
        String professorNumber = "P" + OffsetDateTime.now().getYear() + String.format("%04d", count);

        User user = User.builder()
                .username(professorNumber)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(UserRole.PROFESSOR)
                .isActive(true)
                .loginFailCount(0)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        userRepository.save(user);

        Professor professor = Professor.builder()
                .user(user)
                .professorNumber(professorNumber)
                .department(department)
                .position(request.getPosition())
                .researchField(request.getResearchField())
                .officeLocation(request.getOfficeLocation())
                .officePhone(request.getOfficePhone())
                .status("ACTIVE")
                .hireDate(request.getHireDate())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        professorRepository.save(professor);

        return ProfessorResponse.from(professor);
    }

    @Transactional(readOnly = true)
    public ProfessorResponse getProfessor(Long id) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        return ProfessorResponse.from(professor);
    }

    public ProfessorResponse updateProfessor(Long id, ProfessorUpdateRequest request) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        professor.setDepartment(department);
        professor.setPosition(request.getPosition());
        professor.setResearchField(request.getResearchField());
        professor.setOfficeLocation(request.getOfficeLocation());
        professor.setOfficePhone(request.getOfficePhone());
        professor.setUpdatedAt(OffsetDateTime.now());

        User user = professor.getUser();
        user.setPhone(request.getPhone());
        user.setUpdatedAt(OffsetDateTime.now());

        return ProfessorResponse.from(professor);
    }

    public void updateProfessorStatus(Long id, ProfessorStatusRequest request) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        professor.setStatus(request.getStatus());
        professor.setUpdatedAt(OffsetDateTime.now());
    }

    @Transactional(readOnly = true)
    public Page<CourseListResponse> getProfessorCourses(Long id, Integer year, Integer semester, Pageable pageable) {
        // id is professor id
        return courseRepository.findAllWithFilters(year, semester, null, id, null, pageable)
                .map(CourseListResponse::from);
    }

    @Transactional(readOnly = true)
    public ProfessorResponse getMyInfo(Long userId) {
        Professor professor = professorRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        return ProfessorResponse.from(professor);
    }

    public void updateMyInfo(Long userId, ProfessorMeUpdateRequest request) {
        Professor professor = professorRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        professor.setResearchField(request.getResearchField());
        professor.setOfficeLocation(request.getOfficeLocation());
        professor.setOfficePhone(request.getOfficePhone());
        professor.setUpdatedAt(OffsetDateTime.now());

        User user = professor.getUser();
        user.setPhone(request.getPhone());
        user.setUpdatedAt(OffsetDateTime.now());
    }
}
