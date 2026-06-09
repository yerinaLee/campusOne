package com.campus.campus_api.domain.approval.repository;

import com.campus.campus_api.domain.approval.entity.ApprovalLine;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApprovalLineRepository extends JpaRepository<ApprovalLine, Long> {
}
