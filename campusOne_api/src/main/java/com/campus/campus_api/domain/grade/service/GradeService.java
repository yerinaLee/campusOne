package com.campus.campus_api.domain.grade.service;

import com.campus.campus_api.domain.course.entity.Course;
import com.campus.campus_api.domain.course.repository.CourseRepository;
import com.campus.campus_api.domain.enrollment.entity.Enrollment;
import com.campus.campus_api.domain.enrollment.repository.EnrollmentRepository;
import com.campus.campus_api.domain.grade.dto.GradeResponse;
import com.campus.campus_api.domain.grade.dto.GradeSubmitRequest;
import com.campus.campus_api.domain.grade.dto.GradeUpdateRequest;
import com.campus.campus_api.domain.grade.entity.Grade;
import com.campus.campus_api.domain.grade.repository.GradeRepository;
import com.campus.campus_api.domain.professor.entity.Professor;
import com.campus.campus_api.domain.professor.repository.ProfessorRepository;
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
public class GradeService {

    private final GradeRepository gradeRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;
    private final CourseRepository courseRepository;

    // 학생: 내 성적 목록
    @Transactional(readOnly = true)
    public List<GradeResponse> getMyGrades(User user) {
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.STUDENT_NOT_FOUND));
        return gradeRepository.findByStudentId(student.getId())
                .stream().map(GradeResponse::from).toList();
    }

    // 교수: 강의별 성적 목록
    @Transactional(readOnly = true)
    public List<GradeResponse> getGradesByCourse(User user, Long courseId) {
        Professor professor = professorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.PROFESSOR_NOT_FOUND));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));
        if (!course.getProfessor().getId().equals(professor.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
        return gradeRepository.findByCourseId(courseId)
                .stream().map(GradeResponse::from).toList();
    }

    // 교수: 성적 입력
    public GradeResponse submitGrade(User user, GradeSubmitRequest request) {
        Professor professor = professorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.PROFESSOR_NOT_FOUND));

        Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                .orElseThrow(() -> new CustomException(ErrorCode.ENROLLMENT_NOT_FOUND));

        // 해당 교수의 강의인지 검증
        if (!enrollment.getCourse().getProfessor().getId().equals(professor.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        if (gradeRepository.existsByEnrollmentId(enrollment.getId())) {
            // 이미 성적이 있으면 수정으로 안내 — 409 대신 조회 후 업데이트
            Grade existing = gradeRepository.findByEnrollmentId(enrollment.getId()).get();
            OffsetDateTime now2 = OffsetDateTime.now();
            if (request.getLetterGrade() != null) existing.setLetterGrade(request.getLetterGrade());
            if (request.getScore() != null) existing.setScore(request.getScore());
            if (request.getGradePoints() != null) existing.setGradePoints(request.getGradePoints());
            if (request.getRemark() != null) existing.setRemark(request.getRemark());
            existing.setUpdatedAt(now2);
            return GradeResponse.from(gradeRepository.save(existing));
        }

        OffsetDateTime now = OffsetDateTime.now();
        Grade grade = Grade.builder()
                .enrollment(enrollment)
                .letterGrade(request.getLetterGrade())
                .score(request.getScore())
                .gradePoints(request.getGradePoints())
                .isPassFail(Boolean.TRUE.equals(request.getIsPassFail()))
                .status("SUBMITTED")
                .submittedAt(now)
                .remark(request.getRemark())
                .createdBy(user.getId())
                .createdAt(now)
                .updatedAt(now)
                .build();

        return GradeResponse.from(gradeRepository.save(grade));
    }

    // 교수: 성적 수정
    public GradeResponse updateGrade(User user, Long gradeId, GradeUpdateRequest request) {
        Professor professor = professorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.PROFESSOR_NOT_FOUND));

        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new CustomException(ErrorCode.GRADE_NOT_FOUND));

        if (!grade.getEnrollment().getCourse().getProfessor().getId().equals(professor.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
        if ("CONFIRMED".equals(grade.getStatus())) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (request.getLetterGrade() != null) grade.setLetterGrade(request.getLetterGrade());
        if (request.getScore() != null) grade.setScore(request.getScore());
        if (request.getGradePoints() != null) grade.setGradePoints(request.getGradePoints());
        if (request.getRemark() != null) grade.setRemark(request.getRemark());
        grade.setUpdatedAt(now);

        return GradeResponse.from(gradeRepository.save(grade));
    }
}
