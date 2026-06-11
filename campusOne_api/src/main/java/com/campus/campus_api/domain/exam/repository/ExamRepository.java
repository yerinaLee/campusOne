package com.campus.campus_api.domain.exam.repository;

import com.campus.campus_api.domain.exam.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByCourseIdOrderByExamDateAsc(Long courseId);
    List<Exam> findByExamDate(LocalDate examDate);
}
