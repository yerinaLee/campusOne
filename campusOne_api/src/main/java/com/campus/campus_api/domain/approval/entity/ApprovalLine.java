package com.campus.campus_api.domain.approval.entity;

import com.campus.campus_api.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;

@Entity
@Table(name = "APPROVAL_LINES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class ApprovalLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DOCUMENT_ID", nullable = false)
    private ApprovalDocument document;

    @Column(name = "STEP", nullable = false)
    private Integer step;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "APPROVER_ID", nullable = false)
    private User approver;

    @Column(name = "ROLE_LABEL", length = 100)
    private String roleLabel;

    @Column(name = "ACTION", length = 20)
    private String action;

    @Column(name = "COMMENT", length = 2000)
    private String comment;

    @Column(name = "ACTION_AT")
    private OffsetDateTime actionAt;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
