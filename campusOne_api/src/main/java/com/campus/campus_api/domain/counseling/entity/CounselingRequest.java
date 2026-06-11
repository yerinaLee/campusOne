package com.campus.campus_api.domain.counseling.entity;

import com.campus.campus_api.domain.student.entity.Student;
import com.campus.campus_api.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "COUNSELING_REQUESTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class CounselingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STUDENT_ID", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COUNSELOR_ID")
    private User counselor;

    @Column(name = "COUNSELING_TYPE", length = 30, nullable = false)
    private String counselingType;

    @Column(name = "PREFERRED_DATE")
    private LocalDate preferredDate;

    @Lob
    @Column(name = "REASON", nullable = false)
    private String reason;

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;

    @Column(name = "REJECT_REASON", length = 500)
    private String rejectReason;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "UPDATED_AT", nullable = false)
    private OffsetDateTime updatedAt;
}
