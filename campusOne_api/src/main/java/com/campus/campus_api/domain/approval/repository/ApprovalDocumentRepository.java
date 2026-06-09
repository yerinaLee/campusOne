package com.campus.campus_api.domain.approval.repository;

import com.campus.campus_api.domain.approval.entity.ApprovalDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApprovalDocumentRepository extends JpaRepository<ApprovalDocument, Long> {
    
    @Query("SELECT d FROM ApprovalDocument d WHERE d.drafter.id = :drafterId AND d.deletedAt IS NULL " +
           "AND (:status IS NULL OR d.status = :status)")
    Page<ApprovalDocument> findMyDocuments(@Param("drafterId") Long drafterId, 
                                           @Param("status") String status, 
                                           Pageable pageable);

    @Query("SELECT d FROM ApprovalDocument d JOIN d.approvalLines l " +
           "WHERE l.approver.id = :approverId AND d.deletedAt IS NULL " +
           "AND d.status = 'IN_PROGRESS' " +
           "AND l.action IS NULL AND d.currentStep = l.step")
    Page<ApprovalDocument> findPendingDocuments(@Param("approverId") Long approverId, Pageable pageable);
}
