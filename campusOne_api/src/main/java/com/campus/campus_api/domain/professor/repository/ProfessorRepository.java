package com.campus.campus_api.domain.professor.repository;

import com.campus.campus_api.domain.professor.entity.Professor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {
    Optional<Professor> findByUserId(Long userId);

    @Query("SELECT p FROM Professor p JOIN FETCH p.user u JOIN FETCH p.department d " +
           "WHERE (:keyword IS NULL OR u.name LIKE %:keyword% OR p.professorNumber LIKE %:keyword%) " +
           "AND (:departmentId IS NULL OR d.id = :departmentId) " +
           "AND (:status IS NULL OR p.status = :status)")
    Page<Professor> findAllWithFilters(@Param("keyword") String keyword, 
                                       @Param("departmentId") Long departmentId,
                                       @Param("status") String status,
                                       Pageable pageable);
}
