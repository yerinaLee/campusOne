package com.campus.campus_api.domain.counseling.repository;

import com.campus.campus_api.domain.counseling.entity.CounselingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CounselingRequestRepository extends JpaRepository<CounselingRequest, Long> {
    List<CounselingRequest> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<CounselingRequest> findByCounselorIdOrderByCreatedAtDesc(Long counselorId);
    List<CounselingRequest> findByStatusOrderByCreatedAtDesc(String status);
    boolean existsByStudentIdAndStatusIn(Long studentId, List<String> statuses);
}
