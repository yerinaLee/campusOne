package com.campus.campus_api.domain.attendance.service;

import com.campus.campus_api.domain.attendance.dto.*;
import com.campus.campus_api.domain.attendance.entity.AttendanceRecord;
import com.campus.campus_api.domain.attendance.entity.AttendanceSession;
import com.campus.campus_api.domain.attendance.repository.AttendanceRecordRepository;
import com.campus.campus_api.domain.attendance.repository.AttendanceSessionRepository;
import com.campus.campus_api.domain.course.entity.Course;
import com.campus.campus_api.domain.course.repository.CourseRepository;
import com.campus.campus_api.domain.enrollment.entity.Enrollment;
import com.campus.campus_api.domain.enrollment.repository.EnrollmentRepository;
import com.campus.campus_api.domain.professor.entity.Professor;
import com.campus.campus_api.domain.professor.repository.ProfessorRepository;
import com.campus.campus_api.domain.student.entity.Student;
import com.campus.campus_api.domain.student.repository.StudentRepository;
import com.campus.campus_api.global.exception.CustomException;
import com.campus.campus_api.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final CourseRepository courseRepository;
    private final ProfessorRepository professorRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private final SecureRandom random = new SecureRandom();

    @Transactional
    public AttendanceSessionResponse createSession(Long userId, AttendanceSessionCreateRequest request) {
        Professor professor = professorRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN, "교수 정보가 없습니다."));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND, "강의를 찾을 수 없습니다."));

        if (!course.getProfessor().getId().equals(professor.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN, "본인 담당 강의만 세션을 생성할 수 있습니다.");
        }

        String qrToken = UUID.randomUUID().toString();
        String accessCode = String.format("%06d", random.nextInt(1_000_000));

        AttendanceSession session = AttendanceSession.builder()
                .course(course)
                .professor(professor)
                .lectureDate(request.getLectureDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .lateThreshold(request.getLateThreshold())
                .accessCode(accessCode)
                .qrToken(qrToken)
                .status("ACTIVE")
                .build();

        sessionRepository.save(session);
        return AttendanceSessionResponse.from(session, frontendUrl);
    }

    @Transactional(readOnly = true)
    public AttendanceSessionResponse getSession(Long sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "출결 세션을 찾을 수 없습니다."));

        AttendanceSessionResponse response = AttendanceSessionResponse.from(session, frontendUrl);
        
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(session.getCourse().getId());
        List<AttendanceRecord> records = recordRepository.findBySessionId(sessionId);

        response.setTotalEnrolled((long) enrollments.size());
        response.setPresentCount(records.stream().filter(r -> "PRESENT".equals(r.getStatus())).count());
        response.setLateCount(records.stream().filter(r -> "LATE".equals(r.getStatus())).count());
        response.setAbsentCount(response.getTotalEnrolled() - response.getPresentCount() - response.getLateCount());

        return response;
    }

    @Transactional
    public void closeSession(Long sessionId, Long userId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "출결 세션을 찾을 수 없습니다."));

        checkProfessorAuthority(session, userId);

        session.setStatus("CLOSED");
    }

    @Transactional
    public Map<String, String> regenerateCode(Long sessionId, Long userId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "출결 세션을 찾을 수 없습니다."));

        checkProfessorAuthority(session, userId);

        if (!"ACTIVE".equals(session.getStatus())) {
            throw new CustomException(ErrorCode.ATTENDANCE_SESSION_CLOSED, "이미 종료된 세션입니다.");
        }

        String accessCode = String.format("%06d", random.nextInt(1_000_000));
        session.setAccessCode(accessCode);

        return Map.of("accessCode", accessCode);
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordResponse> getRecordsBySession(Long sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "출결 세션을 찾을 수 없습니다."));
        
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(session.getCourse().getId());
        List<AttendanceRecord> records = recordRepository.findBySessionId(sessionId);
        
        Map<Long, AttendanceRecord> recordMap = records.stream()
                .collect(Collectors.toMap(r -> r.getStudent().getId(), r -> r));

        return enrollments.stream().map(enrollment -> {
            Student student = enrollment.getStudent();
            if (recordMap.containsKey(student.getId())) {
                return AttendanceRecordResponse.from(recordMap.get(student.getId()));
            } else {
                return AttendanceRecordResponse.builder()
                        .sessionId(sessionId)
                        .studentId(student.getId())
                        .studentNumber(student.getStudentNumber())
                        .studentName(student.getUser().getName())
                        .lectureDate(session.getLectureDate())
                        .status("ABSENT")
                        .checkedInAt(null)
                        .isManual(false)
                        .build();
            }
        }).collect(Collectors.toList());
    }

    @Transactional
    public AttendanceRecordResponse updateRecordManual(Long recordId, Long userId, AttendanceManualUpdateRequest request) {
        AttendanceRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "출결 기록을 찾을 수 없습니다."));

        // 권한 체크는 컨트롤러 단에서 @PreAuthorize 로 ADMIN, STAFF 처리한다고 가정
        // 교수의 경우 해당 강의의 교수인지 확인 필요
        // checkProfessorAuthority(record.getSession(), userId); -> ADMIN/STAFF도 접근 가능하므로 별도 로직

        record.setStatus(request.getStatus());
        record.setManualReason(request.getReason());
        record.setIsManual(true);

        return AttendanceRecordResponse.from(record);
    }

    @Transactional(readOnly = true)
    public AttendanceSessionResponse getQrSession(String qrToken) {
        AttendanceSession session = sessionRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "유효하지 않은 QR 토큰입니다."));

        return AttendanceSessionResponse.from(session, frontendUrl);
    }

    @Transactional
    public AttendanceRecordResponse checkIn(Long userId, AttendanceCheckInRequest request) {
        AttendanceSession session = sessionRepository.findByQrToken(request.getQrToken())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "출결 세션을 찾을 수 없습니다."));

        if (!"ACTIVE".equals(session.getStatus()) || OffsetDateTime.now().isAfter(session.getEndTime())) {
            throw new CustomException(ErrorCode.ATTENDANCE_SESSION_CLOSED, "세션이 종료되었거나 시간 만료");
        }

        if (!session.getAccessCode().equals(request.getAccessCode())) {
            throw new CustomException(ErrorCode.INVALID_ACCESS_CODE, "6자리 코드 불일치");
        }

        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "학생 정보가 없습니다."));

        Optional<Enrollment> enrollment = enrollmentRepository.findByCourseIdAndStudentId(session.getCourse().getId(), student.getId());
        if (enrollment.isEmpty()) {
            throw new CustomException(ErrorCode.NOT_ENROLLED, "해당 강의 미수강 학생");
        }

        Optional<AttendanceRecord> existingRecord = recordRepository.findBySessionIdAndStudentId(session.getId(), student.getId());
        if (existingRecord.isPresent()) {
            throw new CustomException(ErrorCode.ALREADY_CHECKED_IN, "이미 체크인 완료");
        }

        String status = "PRESENT";
        if (session.getLateThreshold() != null && OffsetDateTime.now().isAfter(session.getLateThreshold())) {
            status = "LATE";
        }

        AttendanceRecord record = AttendanceRecord.builder()
                .session(session)
                .student(student)
                .status(status)
                .checkedInAt(OffsetDateTime.now())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isManual(false)
                .build();

        recordRepository.save(record);

        return AttendanceRecordResponse.from(record);
    }

    @Transactional(readOnly = true)
    public CourseAttendanceSummaryResponse getCourseAttendanceSummary(Long courseId, Integer year, Integer semester) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND, "강의를 찾을 수 없습니다."));

        long totalSessions = recordRepository.countSessionsByCourseId(courseId);
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        List<AttendanceRecord> records = recordRepository.findByCourseId(courseId);

        Map<Long, List<AttendanceRecord>> recordsByStudent = records.stream()
                .collect(Collectors.groupingBy(r -> r.getStudent().getId()));

        List<CourseAttendanceSummaryResponse.StudentAttendanceSummary> studentSummaries = enrollments.stream().map(enrollment -> {
            Student student = enrollment.getStudent();
            List<AttendanceRecord> studentRecords = recordsByStudent.getOrDefault(student.getId(), new ArrayList<>());

            long presentCount = studentRecords.stream().filter(r -> "PRESENT".equals(r.getStatus())).count();
            long lateCount = studentRecords.stream().filter(r -> "LATE".equals(r.getStatus())).count();
            long absentCount = totalSessions - presentCount - lateCount;

            double rate = totalSessions == 0 ? 0 : (double) (presentCount + (lateCount * 0.5)) / totalSessions * 100;

            return CourseAttendanceSummaryResponse.StudentAttendanceSummary.builder()
                    .studentId(student.getId())
                    .studentNumber(student.getStudentNumber())
                    .studentName(student.getUser().getName())
                    .presentCount(presentCount)
                    .lateCount(lateCount)
                    .absentCount(absentCount)
                    .attendanceRate(Math.round(rate * 10.0) / 10.0)
                    .build();
        }).collect(Collectors.toList());

        return CourseAttendanceSummaryResponse.builder()
                .courseId(course.getId())
                .courseName(course.getName())
                .totalSessions(totalSessions)
                .students(studentSummaries)
                .build();
    }

    @Transactional(readOnly = true)
    public List<MyAttendanceSummaryResponse> getMyAttendance(Long userId, Long courseId, Integer year, Integer semester) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "학생 정보가 없습니다."));

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
        if (courseId != null) {
            enrollments = enrollments.stream()
                    .filter(e -> e.getCourse().getId().equals(courseId))
                    .collect(Collectors.toList());
        }

        return enrollments.stream().map(enrollment -> {
            Long cId = enrollment.getCourse().getId();
            long totalSessions = recordRepository.countSessionsByCourseId(cId);
            List<AttendanceRecord> records = recordRepository.findByStudentIdAndCourseId(student.getId(), cId);

            long presentCount = records.stream().filter(r -> "PRESENT".equals(r.getStatus())).count();
            long lateCount = records.stream().filter(r -> "LATE".equals(r.getStatus())).count();
            long absentCount = totalSessions - presentCount - lateCount;

            double rate = totalSessions == 0 ? 0 : (double) (presentCount + (lateCount * 0.5)) / totalSessions * 100;

            return MyAttendanceSummaryResponse.builder()
                    .courseId(cId)
                    .courseName(enrollment.getCourse().getName())
                    .totalSessions(totalSessions)
                    .presentCount(presentCount)
                    .lateCount(lateCount)
                    .absentCount(absentCount)
                    .attendanceRate(Math.round(rate * 10.0) / 10.0)
                    .records(records.stream().map(AttendanceRecordResponse::from).collect(Collectors.toList()))
                    .build();
        }).collect(Collectors.toList());
    }

    private void checkProfessorAuthority(AttendanceSession session, Long userId) {
        Professor professor = professorRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN, "교수 정보가 없습니다."));
        if (!session.getCourse().getProfessor().getId().equals(professor.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN, "권한이 없습니다.");
        }
    }
}
