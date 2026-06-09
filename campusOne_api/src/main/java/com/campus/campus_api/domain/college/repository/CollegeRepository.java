package com.campus.campus_api.domain.college.repository;

import com.campus.campus_api.domain.college.entity.College;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CollegeRepository extends JpaRepository<College, Long> {
}
