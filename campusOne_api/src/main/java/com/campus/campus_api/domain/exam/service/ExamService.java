package com.campus.campus_api.domain.exam.service;

import com.campus.campus_api.domain.course.entity.Course;
import com.campus.campus_api.domain.course.repository.CourseRepository;
import com.campus.campus_api.domain.enrollment.entity.Enrollment;
import com.campus.campus_api.domain.enrollment.repository.EnrollmentRepository;
import com.campus.campus_api.domain.exam.dto.*;
import com.campus.campus_api.domain.exam.entity.Exam;
import com.campus.campus_api.domain.exam.entity.ExamRegistration;
import com.campus.campus_api.domain.exam.entity.ExamSupervisor;
import com.campus.campus_api.domain.exam.repository.ExamRegistrationRepository;
import com.campus.campus_api.domain.exam.repository.ExamRepository;
import com.campus.campus_api.domain.exam.repository.ExamSupervisorRepository;
import com.campus.campus_api.domain.professor.entity.Professor;
import com.campus.campus_api.domain.professor.repository.ProfessorRepository;
import com.campus.campus_api.domain.student.entity.Student;
import com.campus.campus_api.domain.student.repository.StudentRepository;
import com.campus.campus_api.domain.user.entity.User;
import com.campus.campus_api.domain.user.repository.UserRepository;
import com.campus.campus_api.global.exception.CustomException;
import com.campus.campus_api.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamRegistrationRepository registrationRepository;
    private final ExamSupervisorRepository supervisorRepository;
    private final CourseRepository courseRepository;
    private final ProfessorRepository professorRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional
    public ExamResponse createExam(Long userId, ExamCreateRequest request) {
        Professor professor = professorRepository.findByUserId(userId).orElse(null);
        if (professor == null && !isAdminOrStaff(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN, "접근 권한이 없습니다.");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "강의를 찾을 수 없습니다."));

        if (professor != null && !course.getProfessor().getId().equals(professor.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN, "본인 담당 강의가 아닙니다.");
        }

        Exam exam = Exam.builder()
                .course(course)
                .professor(course.getProfessor())
                .examType(request.getExamType())
                .title(request.getTitle())
                .examDate(request.getExamDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .room(request.getRoom())
                .maxStudents(request.getMaxStudents())
                .status("SCHEDULED")
                .description(request.getDescription())
                .build();

        examRepository.save(exam);

        // 정규 시험의 경우 자동 배정
        if ("MIDTERM".equals(request.getExamType()) || "FINAL".equals(request.getExamType()) || "QUIZ".equals(request.getExamType())) {
            List<Enrollment> enrollments = enrollmentRepository.findByCourseId(course.getId());
            for (Enrollment e : enrollments) {
                if (!"WITHDRAWN".equals(e.getStatus())) {
                    ExamRegistration reg = ExamRegistration.builder()
                            .exam(exam)
                            .student(e.getStudent())
                            .status("REGISTERED")
                            .isSpecial(false)
                            .registeredAt(OffsetDateTime.now())
                            .build();
                    registrationRepository.save(reg);
                }
            }
        }

        return ExamResponse.from(exam, List.of());
    }

    @Transactional(readOnly = true)
    public Page<ExamResponse> getExams(Long courseId, String examType, String from, String to, String status, Pageable pageable) {
        List<Exam> exams;
        if (courseId != null) {
            exams = examRepository.findByCourseIdOrderByExamDateAsc(courseId);
        } else {
            exams = examRepository.findAll();
        }

        if (examType != null && !examType.isEmpty()) {
            exams = exams.stream().filter(e -> e.getExamType().equals(examType)).collect(Collectors.toList());
        }
        if (status != null && !status.isEmpty()) {
            exams = exams.stream().filter(e -> e.getStatus().equals(status)).collect(Collectors.toList());
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), exams.size());
        List<ExamResponse> content = exams.subList(start, end).stream()
                .map(e -> {
                    List<ExamSupervisorResponse> sups = supervisorRepository.findByExamId(e.getId()).stream()
                            .map(ExamSupervisorResponse::from).collect(Collectors.toList());
                    return ExamResponse.from(e, sups);
                })
                .collect(Collectors.toList());

        return new PageImpl<>(content, pageable, exams.size());
    }

    @Transactional(readOnly = true)
    public ExamResponse getExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "시험을 찾을 수 없습니다."));

        List<ExamSupervisorResponse> sups = supervisorRepository.findByExamId(exam.getId()).stream()
                .map(ExamSupervisorResponse::from).collect(Collectors.toList());

        return ExamResponse.from(exam, sups);
    }

    @Transactional
    public ExamResponse updateExam(Long examId, ExamCreateRequest request) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "시험을 찾을 수 없습니다."));

        exam.setExamType(request.getExamType());
        exam.setTitle(request.getTitle());
        exam.setExamDate(request.getExamDate());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setRoom(request.getRoom());
        exam.setMaxStudents(request.getMaxStudents());
        exam.setDescription(request.getDescription());

        List<ExamSupervisorResponse> sups = supervisorRepository.findByExamId(exam.getId()).stream()
                .map(ExamSupervisorResponse::from).collect(Collectors.toList());

        return ExamResponse.from(exam, sups);
    }

    @Transactional
    public void deleteExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "시험을 찾을 수 없습니다."));
        examRepository.delete(exam);
    }

    @Transactional
    public ExamSupervisorResponse assignSupervisor(Long examId, ExamSupervisorAssignRequest request) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "시험을 찾을 수 없습니다."));

        User supervisor = userRepository.findById(request.getSupervisorId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));

        ExamSupervisor examSup = ExamSupervisor.builder()
                .exam(exam)
                .supervisor(supervisor)
                .supervisorRole(request.getRole())
                .build();

        supervisorRepository.save(examSup);
        return ExamSupervisorResponse.from(examSup);
    }

    @Transactional
    public void removeSupervisor(Long examId, Long supervisorId) {
        ExamSupervisor examSup = supervisorRepository.findByExamIdAndSupervisorId(examId, supervisorId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "배정 정보를 찾을 수 없습니다."));
        supervisorRepository.delete(examSup);
    }

    @Transactional
    public ExamRegistrationResponse registerExam(Long examId, Long userId, ExamRegistrationRequest request) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "학생 정보가 없습니다."));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "시험을 찾을 수 없습니다."));

        enrollmentRepository.findByCourseIdAndStudentId(exam.getCourse().getId(), student.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_ENROLLED, "해당 강의 수강생이 아닙니다."));

        if (registrationRepository.findByExamIdAndStudentId(examId, student.getId()).isPresent()) {
            throw new CustomException(ErrorCode.EXAM_ALREADY_REGISTERED, "이미 신청된 특별시험입니다.");
        }

        if (exam.getMaxStudents() != null) {
            long currentCount = registrationRepository.findByExamId(examId).size();
            if (currentCount >= exam.getMaxStudents()) {
                throw new CustomException(ErrorCode.EXAM_FULL, "시험 수용 인원이 초과되었습니다.");
            }
        }

        ExamRegistration reg = ExamRegistration.builder()
                .exam(exam)
                .student(student)
                .status("REGISTERED")
                .isSpecial(true)
                .reason(request.getReason())
                .registeredAt(OffsetDateTime.now())
                .build();

        registrationRepository.save(reg);
        return ExamRegistrationResponse.from(reg);
    }

    @Transactional(readOnly = true)
    public List<ExamRegistrationResponse> getRegistrations(Long examId) {
        return registrationRepository.findByExamId(examId).stream()
                .map(ExamRegistrationResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public ExamRegistrationResponse updateRegistrationStatus(Long examId, Long studentId, ExamStatusUpdateRequest request) {
        ExamRegistration reg = registrationRepository.findByExamIdAndStudentId(examId, studentId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "응시 등록 정보를 찾을 수 없습니다."));

        reg.setStatus(request.getStatus());
        return ExamRegistrationResponse.from(reg);
    }

    @Transactional(readOnly = true)
    public List<MyExamScheduleResponse> getMySchedule(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "학생 정보가 없습니다."));

        return registrationRepository.findByStudentId(student.getId()).stream()
                .map(MyExamScheduleResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MySupervisionResponse> getMySupervision(Long userId) {
        return supervisorRepository.findBySupervisorId(userId).stream()
                .map(MySupervisionResponse::from).collect(Collectors.toList());
    }

    private boolean isAdminOrStaff(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            String role = user.get().getRole().name();
            return "ADMIN".equals(role) || "STAFF".equals(role);
        }
        return false;
    }
}
