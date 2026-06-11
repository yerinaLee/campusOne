package com.campus.campus_api.domain.counseling.repository;

import com.campus.campus_api.domain.counseling.entity.CounselingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CounselingRecordRepository extends JpaRepository<CounselingRecord, Long> {
    List<CounselingRecord> findByStudentIdOrderByCounseledAtDesc(Long studentId);
    List<CounselingRecord> findByCounselorIdOrderByCounseledAtDesc(Long counselorId);
    List<CounselingRecord> findByStudentIdAndIsConfidentialFalseOrderByCounseledAtDesc(Long studentId);
}
