package com.campus.campus_api.domain.enrollment.service;

import com.campus.campus_api.domain.course.entity.Course;
import com.campus.campus_api.domain.course.repository.CourseRepository;
import com.campus.campus_api.domain.enrollment.dto.EnrollRequest;
import com.campus.campus_api.domain.enrollment.dto.EnrollmentResponse;
import com.campus.campus_api.domain.enrollment.entity.Enrollment;
import com.campus.campus_api.domain.enrollment.repository.EnrollmentRepository;
import com.campus.campus_api.domain.student.entity.Student;
import com.campus.campus_api.domain.student.repository.StudentRepository;
import com.campus.campus_api.domain.user.entity.User;
import com.campus.campus_api.global.exception.CustomException;
import com.campus.campus_api.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getMyEnrollments(User user) {
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.STUDENT_NOT_FOUND));
        return enrollmentRepository.findActiveByStudentId(student.getId())
                .stream().map(EnrollmentResponse::from).toList();
    }

    public EnrollmentResponse enroll(User user, EnrollRequest request) {
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.STUDENT_NOT_FOUND));
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

        if (!"OPEN".equals(course.getStatus())) {
            throw new CustomException(ErrorCode.COURSE_NOT_OPEN);
        }
        if (course.getCurrentEnrollment() >= course.getMaxEnrollment()) {
            throw new CustomException(ErrorCode.ENROLLMENT_FULL);
        }

        OffsetDateTime now = OffsetDateTime.now();
        int currentYear = now.getYear();
        int currentSemester = now.getMonthValue() <= 6 ? 1 : 2;

        boolean alreadyEnrolled = enrollmentRepository
                .existsByStudentIdAndCourseIdAndYearAndSemesterAndStatusNot(
                        student.getId(), course.getId(), currentYear, currentSemester, "WITHDRAWN");
        if (alreadyEnrolled) {
            throw new CustomException(ErrorCode.ALREADY_ENROLLED);
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .year(currentYear)
                .semester(currentSemester)
                .status("ENROLLED")
                .enrolledAt(now)
                .createdBy(user.getId())
                .createdAt(now)
                .updatedAt(now)
                .build();

        course.setCurrentEnrollment(course.getCurrentEnrollment() + 1);
        courseRepository.save(course);
        return EnrollmentResponse.from(enrollmentRepository.save(enrollment));
    }

    public void withdraw(User user, Long enrollmentId) {
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.STUDENT_NOT_FOUND));
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new CustomException(ErrorCode.ENROLLMENT_NOT_FOUND));

        if (!enrollment.getStudent().getId().equals(student.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
        if ("WITHDRAWN".equals(enrollment.getStatus())) {
            throw new CustomException(ErrorCode.ALREADY_WITHDRAWN);
        }

        OffsetDateTime now = OffsetDateTime.now();
        enrollment.setStatus("WITHDRAWN");
        enrollment.setWithdrawnAt(now);
        enrollment.setUpdatedAt(now);

        Course course = enrollment.getCourse();
        if (course.getCurrentEnrollment() > 0) {
            course.setCurrentEnrollment(course.getCurrentEnrollment() - 1);
            courseRepository.save(course);
        }
        enrollmentRepository.save(enrollment);
    }
}
