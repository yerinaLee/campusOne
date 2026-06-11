package com.campus.campus_api.domain.assignment.service;

import com.campus.campus_api.domain.assignment.dto.*;
import com.campus.campus_api.domain.assignment.entity.Assignment;
import com.campus.campus_api.domain.assignment.entity.AssignmentSubmission;
import com.campus.campus_api.domain.assignment.repository.AssignmentRepository;
import com.campus.campus_api.domain.assignment.repository.AssignmentSubmissionRepository;
import com.campus.campus_api.domain.course.entity.Course;
import com.campus.campus_api.domain.course.repository.CourseRepository;
import com.campus.campus_api.domain.enrollment.entity.Enrollment;
import com.campus.campus_api.domain.enrollment.repository.EnrollmentRepository;
import com.campus.campus_api.domain.professor.entity.Professor;
import com.campus.campus_api.domain.professor.repository.ProfessorRepository;
import com.campus.campus_api.domain.student.entity.Student;
import com.campus.campus_api.domain.student.repository.StudentRepository;
import com.campus.campus_api.domain.user.entity.User;
import com.campus.campus_api.domain.user.repository.UserRepository;
import com.campus.campus_api.global.exception.CustomException;
import com.campus.campus_api.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final CourseRepository courseRepository;
    private final ProfessorRepository professorRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Transactional
    public AssignmentResponse createAssignment(Long userId, AssignmentCreateRequest request) {
        Professor professor = professorRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "교수 정보가 없습니다."));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "강의를 찾을 수 없습니다."));

        if (!course.getProfessor().getId().equals(professor.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN, "본인 담당 강의가 아닙니다.");
        }

        Assignment assignment = Assignment.builder()
                .course(course)
                .professor(professor)
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .maxScore(request.getMaxScore())
                .allowLateSubmit(request.getAllowLateSubmit() != null ? request.getAllowLateSubmit() : false)
                .isVisible(request.getIsVisible() != null ? request.getIsVisible() : true)
                .submissionType(request.getSubmissionType())
                .status("OPEN")
                .build();

        assignmentRepository.save(assignment);
        return AssignmentResponse.from(assignment, 0, 0, null);
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignments(Long userId, String role, Long courseId, String status) {
        List<Assignment> assignments = assignmentRepository.findByCourseIdOrderByDueDateDesc(courseId);

        if (status != null && !status.isEmpty()) {
            assignments = assignments.stream().filter(a -> a.getStatus().equals(status)).collect(Collectors.toList());
        }

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        int totalEnrolled = (int) enrollments.stream().filter(e -> !"WITHDRAWN".equals(e.getStatus())).count();

        Student student = null;
        if ("STUDENT".equals(role)) {
            student = studentRepository.findByUserId(userId).orElse(null);
        }

        Student finalStudent = student;
        return assignments.stream().map(assignment -> {
            List<AssignmentSubmission> submissions = submissionRepository.findByAssignmentId(assignment.getId());
            AssignmentSubmissionResponse mySub = null;
            if (finalStudent != null) {
                Optional<AssignmentSubmission> sub = submissions.stream()
                        .filter(s -> s.getStudent().getId().equals(finalStudent.getId())).findFirst();
                if (sub.isPresent()) {
                    mySub = AssignmentSubmissionResponse.from(sub.get());
                }
            }
            return AssignmentResponse.from(assignment, submissions.size(), "STUDENT".equals(role) ? null : totalEnrolled, mySub);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssignmentResponse getAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "과제를 찾을 수 없습니다."));
        return AssignmentResponse.from(assignment, 0, 0, null);
    }

    @Transactional
    public AssignmentResponse updateAssignment(Long assignmentId, Long userId, AssignmentCreateRequest request) {
        Professor professor = professorRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "교수 정보가 없습니다."));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "과제를 찾을 수 없습니다."));

        if (!assignment.getProfessor().getId().equals(professor.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN, "수정 권한이 없습니다.");
        }

        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setDueDate(request.getDueDate());
        if (request.getMaxScore() != null) assignment.setMaxScore(request.getMaxScore());
        if (request.getAllowLateSubmit() != null) assignment.setAllowLateSubmit(request.getAllowLateSubmit());
        if (request.getIsVisible() != null) assignment.setIsVisible(request.getIsVisible());
        if (request.getSubmissionType() != null) assignment.setSubmissionType(request.getSubmissionType());

        return AssignmentResponse.from(assignment, 0, 0, null);
    }

    @Transactional
    public void deleteAssignment(Long assignmentId, Long userId) {
        Professor professor = professorRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "교수 정보가 없습니다."));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "과제를 찾을 수 없습니다."));

        if (!assignment.getProfessor().getId().equals(professor.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN, "삭제 권한이 없습니다.");
        }

        assignmentRepository.delete(assignment);
    }

    @Transactional
    public AssignmentSubmissionResponse submitAssignment(Long assignmentId, Long userId, AssignmentSubmitRequest request) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "학생 정보가 없습니다."));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "과제를 찾을 수 없습니다."));

        enrollmentRepository.findByCourseIdAndStudentId(assignment.getCourse().getId(), student.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_ENROLLED, "해당 강의 수강생이 아닙니다."));

        if (submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId()).isPresent()) {
            throw new CustomException(ErrorCode.SUBMISSION_ALREADY_EXISTS, "과제가 이미 제출되었습니다.");
        }

        OffsetDateTime now = OffsetDateTime.now();
        String status = "SUBMITTED";

        if (now.isAfter(assignment.getDueDate())) {
            if (!assignment.getAllowLateSubmit()) {
                throw new CustomException(ErrorCode.ASSIGNMENT_CLOSED, "과제 제출 기한이 지났습니다.");
            }
            status = "LATE";
        }

        AssignmentSubmission submission = AssignmentSubmission.builder()
                .assignment(assignment)
                .student(student)
                .content(request.getContent())
                .status(status)
                .submittedAt(now)
                .build();

        submissionRepository.save(submission);
        return AssignmentSubmissionResponse.from(submission);
    }

    @Transactional(readOnly = true)
    public AssignmentSubmissionsStatusResponse getSubmissionsStatus(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "과제를 찾을 수 없습니다."));

        List<AssignmentSubmission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        int submittedCount = 0;
        int lateCount = 0;

        for (AssignmentSubmission sub : submissions) {
            if ("LATE".equals(sub.getStatus())) {
                lateCount++;
            } else if ("SUBMITTED".equals(sub.getStatus()) || "GRADED".equals(sub.getStatus())) {
                submittedCount++;
            }
        }

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(assignment.getCourse().getId());
        int totalEnrolled = (int) enrollments.stream().filter(e -> !"WITHDRAWN".equals(e.getStatus())).count();
        int notSubmittedCount = totalEnrolled - (submittedCount + lateCount);

        List<AssignmentSubmissionResponse> subResponses = submissions.stream()
                .map(AssignmentSubmissionResponse::from)
                .collect(Collectors.toList());

        return AssignmentSubmissionsStatusResponse.builder()
                .assignmentId(assignment.getId())
                .title(assignment.getTitle())
                .submittedCount(submittedCount)
                .lateCount(lateCount)
                .notSubmittedCount(Math.max(0, notSubmittedCount))
                .submissions(subResponses)
                .build();
    }

    @Transactional
    public AssignmentSubmissionResponse gradeSubmission(Long assignmentId, Long studentId, Long userId, AssignmentGradeRequest request) {
        AssignmentSubmission submission = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "제출된 과제를 찾을 수 없습니다."));

        User grader = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, "채점자 정보가 없습니다."));

        submission.setStatus("GRADED");
        submission.setScore(request.getScore());
        submission.setFeedback(request.getFeedback());
        submission.setGradedAt(OffsetDateTime.now());
        submission.setGradedBy(grader);

        return AssignmentSubmissionResponse.from(submission);
    }
}
