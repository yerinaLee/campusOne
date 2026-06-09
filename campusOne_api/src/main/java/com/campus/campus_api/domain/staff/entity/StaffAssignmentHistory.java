package com.campus.campus_api.domain.staff.entity;

import com.campus.campus_api.domain.office.entity.AdministrativeOffice;
import com.campus.campus_api.domain.office.entity.JobPosition;
import com.campus.campus_api.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "STAFF_ASSIGNMENT_HISTORY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class StaffAssignmentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STAFF_MEMBER_ID", nullable = false)
    private StaffMember staffMember;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FROM_OFFICE_ID")
    private AdministrativeOffice fromOffice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TO_OFFICE_ID", nullable = false)
    private AdministrativeOffice toOffice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FROM_POSITION_ID")
    private JobPosition fromPosition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TO_POSITION_ID", nullable = false)
    private JobPosition toPosition;

    @Column(name = "ASSIGNMENT_TYPE", length = 30, nullable = false)
    private String assignmentType;

    @Column(name = "EFFECTIVE_DATE", nullable = false)
    private LocalDate effectiveDate;

    @Column(name = "REASON", length = 500)
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROCESSED_BY")
    private User processedBy;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
