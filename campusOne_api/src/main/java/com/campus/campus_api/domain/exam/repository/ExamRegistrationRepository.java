package com.campus.campus_api.domain.exam.repository;

import com.campus.campus_api.domain.exam.entity.ExamRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRegistrationRepository extends JpaRepository<ExamRegistration, Long> {
    List<ExamRegistration> findByExamId(Long examId);
    Optional<ExamRegistration> findByExamIdAndStudentId(Long examId, Long studentId);
    
    @Query("SELECT r FROM ExamRegistration r JOIN FETCH r.exam e WHERE r.student.id = :studentId ORDER BY e.examDate ASC")
    List<ExamRegistration> findByStudentId(@Param("studentId") Long studentId);
}
