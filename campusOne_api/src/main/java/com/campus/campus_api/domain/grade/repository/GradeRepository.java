package com.campus.campus_api.domain.grade.repository;

import com.campus.campus_api.domain.grade.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GradeRepository extends JpaRepository<Grade, Long> {

    Optional<Grade> findByEnrollmentId(Long enrollmentId);

    // 학생의 수강신청 ID 목록에 해당하는 성적 전체 (내 성적 조회)
    @Query("SELECT g FROM Grade g " +
           "JOIN FETCH g.enrollment e " +
           "JOIN FETCH e.course c " +
           "WHERE e.student.id = :studentId AND e.status <> 'WITHDRAWN'")
    List<Grade> findByStudentId(@Param("studentId") Long studentId);

    // 교수가 담당하는 강의의 수강생 성적 목록
    @Query("SELECT g FROM Grade g " +
           "JOIN FETCH g.enrollment e " +
           "JOIN FETCH e.student s " +
           "JOIN FETCH s.user u " +
           "WHERE e.course.id = :courseId")
    List<Grade> findByCourseId(@Param("courseId") Long courseId);

    boolean existsByEnrollmentId(Long enrollmentId);
}
