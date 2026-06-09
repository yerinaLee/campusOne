package com.campus.campus_api.domain.course.service;

import com.campus.campus_api.domain.course.dto.CourseCreateRequest;
import com.campus.campus_api.domain.course.dto.CourseDetailResponse;
import com.campus.campus_api.domain.course.dto.CourseListResponse;
import com.campus.campus_api.domain.course.dto.CourseUpdateRequest;
import com.campus.campus_api.domain.course.entity.Course;
import com.campus.campus_api.domain.course.entity.CourseSchedule;
import com.campus.campus_api.domain.course.repository.CourseRepository;
import com.campus.campus_api.domain.course.repository.CourseScheduleRepository;
import com.campus.campus_api.domain.department.entity.Department;
import com.campus.campus_api.domain.department.repository.DepartmentRepository;
import com.campus.campus_api.domain.professor.entity.Professor;
import com.campus.campus_api.domain.professor.repository.ProfessorRepository;
import com.campus.campus_api.global.exception.CustomException;
import com.campus.campus_api.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;
    private final ProfessorRepository professorRepository;
    private final CourseScheduleRepository courseScheduleRepository;

    @Transactional(readOnly = true)
    public Page<CourseListResponse> getCourses(Integer year, Integer semester,
                                                Long departmentId, String keyword,
                                                Pageable pageable) {
        return courseRepository.findAllWithFilters(year, semester, departmentId, null, keyword, pageable)
                .map(CourseListResponse::from);
    }

    @Transactional(readOnly = true)
    public CourseDetailResponse getCourse(Long id) {
        return courseRepository.findById(id)
                .filter(c -> c.getDeletedAt() == null)
                .map(CourseDetailResponse::from)
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));
    }

    public CourseDetailResponse createCourse(CourseCreateRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        Professor professor = professorRepository.findById(request.getProfessorId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        long count = courseRepository.count() + 1;
        String courseCode = request.getDepartmentId() + "C" + request.getYear() + String.format("%04d", count);

        Course course = Course.builder()
                .courseCode(courseCode)
                .name(request.getName())
                .department(department)
                .professor(professor)
                .credit(request.getCredit())
                .year(request.getYear())
                .semester(request.getSemester())
                .maxEnrollment(request.getMaxEnrollment())
                .currentEnrollment(0)
                .classroom(request.getClassroom())
                .courseType(request.getCourseType())
                .description(request.getDescription())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        courseRepository.save(course);

        if (request.getSchedules() != null) {
            for (CourseCreateRequest.ScheduleRequest sr : request.getSchedules()) {
                CourseSchedule schedule = CourseSchedule.builder()
                        .course(course)
                        .dayOfWeek(sr.getDayOfWeek())
                        .periodStart(sr.getPeriodStart())
                        .periodEnd(sr.getPeriodEnd())
                        .classroom(sr.getClassroom())
                        .build();
                courseScheduleRepository.save(schedule);
                course.getSchedules().add(schedule);
            }
        }

        return CourseDetailResponse.from(course);
    }

    public CourseDetailResponse updateCourse(Long id, CourseUpdateRequest request) {
        Course course = courseRepository.findById(id)
                .filter(c -> c.getDeletedAt() == null)
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

        course.setName(request.getName());
        course.setCredit(request.getCredit());
        course.setMaxEnrollment(request.getMaxEnrollment());
        course.setClassroom(request.getClassroom());
        course.setDescription(request.getDescription());
        course.setUpdatedAt(OffsetDateTime.now());

        // For simplicity, skip updating schedules for now, or you could drop and recreate
        // courseScheduleRepository.deleteAll(course.getSchedules());
        // course.getSchedules().clear();
        // create new schedules ...

        return CourseDetailResponse.from(course);
    }

    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .filter(c -> c.getDeletedAt() == null)
                .orElseThrow(() -> new CustomException(ErrorCode.COURSE_NOT_FOUND));

        course.setDeletedAt(OffsetDateTime.now());
        course.setUpdatedAt(OffsetDateTime.now());
    }
}
