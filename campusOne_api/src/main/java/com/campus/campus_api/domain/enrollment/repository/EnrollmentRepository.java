package com.campus.campus_api.domain.enrollment.repository;

import com.campus.campus_api.domain.enrollment.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    @Query("""
        SELECT e FROM Enrollment e
        JOIN FETCH e.course c
        JOIN FETCH c.professor p JOIN FETCH p.user
        JOIN FETCH c.department
        WHERE e.student.id = :studentId AND e.status != 'WITHDRAWN'
        """)
    List<Enrollment> findActiveByStudentId(@Param("studentId") Long studentId);

    boolean existsByStudentIdAndCourseIdAndYearAndSemesterAndStatusNot(
            Long studentId, Long courseId, Integer year, Integer semester, String status);

    @Query("""
        SELECT e FROM Enrollment e
        JOIN FETCH e.student s JOIN FETCH s.user
        WHERE e.course.id = :courseId AND e.status != 'WITHDRAWN'
        """)
    List<Enrollment> findActiveByCourseId(@Param("courseId") Long courseId);
}
