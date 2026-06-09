package com.campus.campus_api.domain.department.repository;

import com.campus.campus_api.domain.department.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByDeletedAtIsNull();
    List<Department> findByCollegeIdAndDeletedAtIsNull(Long collegeId);
}
