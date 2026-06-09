package com.campus.campus_api.domain.office.repository;

import com.campus.campus_api.domain.office.entity.JobPosition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobPositionRepository extends JpaRepository<JobPosition, Long> {
    List<JobPosition> findByIsActiveTrueOrderByGradeLevelAsc();
}
