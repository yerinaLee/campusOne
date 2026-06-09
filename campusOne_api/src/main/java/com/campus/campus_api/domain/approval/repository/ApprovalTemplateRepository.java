package com.campus.campus_api.domain.approval.repository;

import com.campus.campus_api.domain.approval.entity.ApprovalTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApprovalTemplateRepository extends JpaRepository<ApprovalTemplate, Long> {
    List<ApprovalTemplate> findByIsActiveTrue();
}
