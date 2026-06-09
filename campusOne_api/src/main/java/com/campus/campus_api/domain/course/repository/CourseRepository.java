package com.campus.campus_api.domain.course.repository;

import com.campus.campus_api.domain.course.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("""
        SELECT DISTINCT c FROM Course c
        JOIN FETCH c.professor p JOIN FETCH p.user
        JOIN FETCH c.department d
        WHERE c.deletedAt IS NULL
          AND (:year IS NULL OR c.year = :year)
          AND (:semester IS NULL OR c.semester = :semester)
          AND (:departmentId IS NULL OR d.id = :departmentId)
          AND (:professorId IS NULL OR p.id = :professorId)
          AND (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(c.courseCode) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<Course> findAllWithFilters(
            @Param("year") Integer year,
            @Param("semester") Integer semester,
            @Param("departmentId") Long departmentId,
            @Param("professorId") Long professorId,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query("""
        SELECT c FROM Course c
        JOIN FETCH c.professor p JOIN FETCH p.user
        JOIN FETCH c.department d
        WHERE c.deletedAt IS NULL AND p.user.id = :userId
        """)
    List<Course> findByProfessorUserId(@Param("userId") Long userId);
}
