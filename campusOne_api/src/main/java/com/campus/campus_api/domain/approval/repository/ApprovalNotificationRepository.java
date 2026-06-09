package com.campus.campus_api.domain.approval.repository;

import com.campus.campus_api.domain.approval.entity.ApprovalNotification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApprovalNotificationRepository extends JpaRepository<ApprovalNotification, Long> {
}
