package com.campus.campus_api.domain.staff.repository;

import com.campus.campus_api.domain.staff.entity.StaffAssignmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffAssignmentHistoryRepository extends JpaRepository<StaffAssignmentHistory, Long> {
    List<StaffAssignmentHistory> findByStaffMemberIdOrderByEffectiveDateDesc(Long staffId);
}
