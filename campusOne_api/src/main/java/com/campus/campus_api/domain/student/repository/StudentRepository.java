package com.campus.campus_api.domain.student.repository;

import com.campus.campus_api.domain.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);

    @Query("SELECT s FROM Student s JOIN FETCH s.user u JOIN FETCH s.department d LEFT JOIN FETCH d.college c " +
           "WHERE (:keyword IS NULL OR u.name LIKE %:keyword% OR s.studentNumber LIKE %:keyword%) " +
           "AND (:departmentId IS NULL OR d.id = :departmentId) " +
           "AND (:status IS NULL OR s.status = :status) " +
           "AND (:grade IS NULL OR s.grade = :grade)")
    Page<Student> findAllWithFilters(@Param("keyword") String keyword, 
                                     @Param("departmentId") Long departmentId,
                                     @Param("status") String status,
                                     @Param("grade") Integer grade, 
                                     Pageable pageable);
}
