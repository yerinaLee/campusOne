package com.campus.campus_api.domain.counseling.entity;

import com.campus.campus_api.domain.student.entity.Student;
import com.campus.campus_api.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;

@Entity
@Table(name = "COUNSELING_RECORDS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class CounselingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "REQUEST_ID")
    private CounselingRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STUDENT_ID", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COUNSELOR_ID", nullable = false)
    private User counselor;

    @Column(name = "COUNSELING_TYPE", length = 30, nullable = false)
    private String counselingType;

    @Column(name = "SUBJECT", length = 500, nullable = false)
    private String subject;

    @Lob
    @Column(name = "CONTENT", nullable = false)
    private String content;

    @Lob
    @Column(name = "OUTCOME")
    private String outcome;

    @Column(name = "FOLLOW_UP", length = 1000)
    private String followUp;

    @Column(name = "COUNSELED_AT", nullable = false)
    private OffsetDateTime counseledAt;

    @Column(name = "IS_NOTIFIED", columnDefinition = "NUMBER(1,0)", nullable = false)
    private Boolean isNotified;

    @Column(name = "IS_CONFIDENTIAL", columnDefinition = "NUMBER(1,0)", nullable = false)
    private Boolean isConfidential;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "UPDATED_AT", nullable = false)
    private OffsetDateTime updatedAt;
}
