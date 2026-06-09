package com.campus.campus_api.domain.approval.service;

import com.campus.campus_api.domain.approval.dto.*;
import com.campus.campus_api.domain.approval.entity.*;
import com.campus.campus_api.domain.approval.repository.*;
import com.campus.campus_api.domain.user.entity.User;
import com.campus.campus_api.domain.user.repository.UserRepository;
import com.campus.campus_api.global.exception.CustomException;
import com.campus.campus_api.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ApprovalService {

    private final ApprovalTemplateRepository templateRepository;
    private final ApprovalDocumentRepository documentRepository;
    private final ApprovalLineRepository lineRepository;
    private final ApprovalNotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ApprovalTemplateResponse> getTemplates() {
        return templateRepository.findByIsActiveTrue().stream()
                .map(ApprovalTemplateResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ApprovalDocumentResponse> getDocuments(Long userId, String type, String status, Pageable pageable) {
        if ("RECEIVED".equals(type)) {
            return documentRepository.findPendingDocuments(userId, pageable)
                    .map(ApprovalDocumentResponse::from);
        } else {
            return documentRepository.findMyDocuments(userId, status, pageable)
                    .map(ApprovalDocumentResponse::from);
        }
    }

    @Transactional(readOnly = true)
    public ApprovalDocumentResponse getDocument(Long id) {
        return documentRepository.findById(id)
                .filter(d -> d.getDeletedAt() == null)
                .map(ApprovalDocumentResponse::from)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));
    }

    public ApprovalDocumentResponse createDocument(Long drafterId, ApprovalDocumentCreateRequest request) {
        ApprovalTemplate template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        User drafter = userRepository.findById(drafterId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        ApprovalDocument document = ApprovalDocument.builder()
                .template(template)
                .title(request.getTitle())
                .drafter(drafter)
                .content(request.getContent())
                .formData(request.getFormData())
                .status("IN_PROGRESS")
                .currentStep(1)
                .submittedAt(OffsetDateTime.now())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        documentRepository.save(document);

        for (ApprovalDocumentCreateRequest.ApprovalLineRequest lineReq : request.getApprovalLines()) {
            User approver = userRepository.findById(lineReq.getApproverId())
                    .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

            ApprovalLine line = ApprovalLine.builder()
                    .document(document)
                    .step(lineReq.getStep())
                    .approver(approver)
                    .roleLabel(lineReq.getRoleLabel())
                    .createdAt(OffsetDateTime.now())
                    .build();
            lineRepository.save(line);
            document.getApprovalLines().add(line);
        }

        // Send notification to the first approver
        document.getApprovalLines().stream()
                .filter(l -> l.getStep() == 1)
                .findFirst()
                .ifPresent(l -> sendNotification(l.getApprover(), document, "새로운 결재 요청이 있습니다."));

        return ApprovalDocumentResponse.from(document);
    }

    public void processDocument(Long documentId, Long approverId, ApprovalProcessRequest request) {
        ApprovalDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        if (!"IN_PROGRESS".equals(document.getStatus())) {
            throw new CustomException(ErrorCode.BAD_REQUEST, "결재가 진행 중인 문서가 아닙니다.");
        }

        ApprovalLine currentLine = document.getApprovalLines().stream()
                .filter(l -> l.getStep().equals(document.getCurrentStep()) && l.getApprover().getId().equals(approverId))
                .findFirst()
                .orElseThrow(() -> new CustomException(ErrorCode.BAD_REQUEST, "현재 결재자가 아닙니다."));

        currentLine.setAction(request.getAction());
        currentLine.setComment(request.getComment());
        currentLine.setActionAt(OffsetDateTime.now());

        if ("REJECTED".equals(request.getAction())) {
            document.setStatus("REJECTED");
            document.setCompletedAt(OffsetDateTime.now());
            sendNotification(document.getDrafter(), document, "결재가 반려되었습니다.");
        } else if ("APPROVED".equals(request.getAction())) {
            int maxStep = document.getApprovalLines().stream().mapToInt(ApprovalLine::getStep).max().orElse(1);
            if (document.getCurrentStep() < maxStep) {
                document.setCurrentStep(document.getCurrentStep() + 1);
                // Notify next approver
                document.getApprovalLines().stream()
                        .filter(l -> l.getStep().equals(document.getCurrentStep()))
                        .findFirst()
                        .ifPresent(l -> sendNotification(l.getApprover(), document, "새로운 결재 요청이 있습니다."));
            } else {
                document.setStatus("APPROVED");
                document.setCompletedAt(OffsetDateTime.now());
                sendNotification(document.getDrafter(), document, "결재가 완료되었습니다.");
            }
        }

        document.setUpdatedAt(OffsetDateTime.now());
    }

    public void deleteDocument(Long documentId, Long drafterId) {
        ApprovalDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND));

        if (!document.getDrafter().getId().equals(drafterId)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }

        if (!"DRAFT".equals(document.getStatus()) && !"REJECTED".equals(document.getStatus())) {
            throw new CustomException(ErrorCode.BAD_REQUEST, "진행 중이거나 완료된 결재는 삭제할 수 없습니다.");
        }

        document.setDeletedAt(OffsetDateTime.now());
        document.setUpdatedAt(OffsetDateTime.now());
    }

    private void sendNotification(User user, ApprovalDocument document, String message) {
        ApprovalNotification notification = ApprovalNotification.builder()
                .user(user)
                .document(document)
                .message(message)
                .isRead(false)
                .createdAt(OffsetDateTime.now())
                .build();
        notificationRepository.save(notification);
    }
}
