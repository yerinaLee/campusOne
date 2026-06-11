package com.campus.campus_api.domain.exam.repository;

import com.campus.campus_api.domain.exam.entity.ExamSupervisor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamSupervisorRepository extends JpaRepository<ExamSupervisor, Long> {
    List<ExamSupervisor> findByExamId(Long examId);
    List<ExamSupervisor> findBySupervisorId(Long supervisorId);
    Optional<ExamSupervisor> findByExamIdAndSupervisorId(Long examId, Long supervisorId);
}
