package com.campus.campus_api.domain.approval.entity;

import com.campus.campus_api.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "APPROVAL_DOCUMENTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class ApprovalDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TEMPLATE_ID", nullable = false)
    private ApprovalTemplate template;

    @Column(name = "TITLE", length = 500, nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DRAFTER_ID", nullable = false)
    private User drafter;

    @Column(name = "CONTENT", columnDefinition = "CLOB", nullable = false)
    private String content;

    @Column(name = "FORM_DATA", columnDefinition = "CLOB")
    private String formData;

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;

    @Column(name = "CURRENT_STEP", nullable = false)
    private Integer currentStep;

    @Column(name = "SUBMITTED_AT")
    private OffsetDateTime submittedAt;

    @Column(name = "COMPLETED_AT")
    private OffsetDateTime completedAt;

    @Column(name = "CREATED_BY")
    private Long createdBy;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "UPDATED_AT", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "DELETED_AT")
    private OffsetDateTime deletedAt;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ApprovalLine> approvalLines = new ArrayList<>();
}
