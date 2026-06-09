package com.campus.campus_api.domain.staff.repository;

import com.campus.campus_api.domain.staff.entity.StaffJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffJobRepository extends JpaRepository<StaffJob, Long> {
    List<StaffJob> findByStaffMemberId(Long staffId);
}
