package com.campus.campus_api.domain.student.service;

import com.campus.campus_api.domain.department.entity.Department;
import com.campus.campus_api.domain.department.repository.DepartmentRepository;
import com.campus.campus_api.domain.student.dto.*;
import com.campus.campus_api.domain.student.entity.Student;
import com.campus.campus_api.domain.student.repository.StudentRepository;
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
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<StudentResponse> getStudents(String keyword, Long departmentId, String status, Integer grade, Pageable pageable) {
        return studentRepository.findAllWithFilters(keyword, departmentId, status, grade, pageable)
                .map(StudentResponse::from);
    }

    public StudentResponse createStudent(StudentCreateRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        // Generate student number: Year + 4 digits (e.g., 20240001)
        // Simplified generation
        long count = studentRepository.count() + 1;
        String studentNumber = request.getAdmissionYear() + String.format("%04d", count);

        User user = User.builder()
                .username(studentNumber) // username is student number
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(UserRole.STUDENT)
                .isActive(true)
                .loginFailCount(0)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
        
        userRepository.save(user);

        Student student = Student.builder()
                .user(user)
                .studentNumber(studentNumber)
                .department(department)
                .grade(request.getGrade())
                .semester(request.getSemester())
                .admissionYear(request.getAdmissionYear())
                .status("ENROLLED")
                .address(request.getAddress())
                .birthDate(request.getBirthDate())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        studentRepository.save(student);

        return StudentResponse.from(student);
    }

    @Transactional(readOnly = true)
    public StudentResponse getStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        return StudentResponse.from(student);
    }

    public StudentResponse updateStudent(Long id, StudentUpdateRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        student.setDepartment(department);
        student.setGrade(request.getGrade());
        student.setSemester(request.getSemester());
        student.setAddress(request.getAddress());
        student.setUpdatedAt(OffsetDateTime.now());

        User user = student.getUser();
        user.setPhone(request.getPhone());
        user.setUpdatedAt(OffsetDateTime.now());

        return StudentResponse.from(student);
    }

    public void updateStudentStatus(Long id, StudentStatusRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        student.setStatus(request.getStatus());
        student.setUpdatedAt(OffsetDateTime.now());
    }

    @Transactional(readOnly = true)
    public StudentResponse getMyInfo(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        return StudentResponse.from(student);
    }

    public void updateMyInfo(Long userId, StudentMeUpdateRequest request) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
        student.setAddress(request.getAddress());
        student.setUpdatedAt(OffsetDateTime.now());

        User user = student.getUser();
        user.setPhone(request.getPhone());
        user.setUpdatedAt(OffsetDateTime.now());
    }
}
