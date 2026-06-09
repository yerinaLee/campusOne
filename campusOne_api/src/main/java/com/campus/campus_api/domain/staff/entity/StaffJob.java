package com.campus.campus_api.domain.staff.entity;

import com.campus.campus_api.domain.office.entity.AdministrativeOffice;
import com.campus.campus_api.domain.office.entity.JobPosition;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "STAFF_JOBS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class StaffJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STAFF_MEMBER_ID", nullable = false)
    private StaffMember staffMember;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OFFICE_ID", nullable = false)
    private AdministrativeOffice office;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POSITION_ID", nullable = false)
    private JobPosition jobPosition;

    @Column(name = "DEPARTMENT_ID")
    private Long departmentId;

    @Column(name = "JOB_TITLE", length = 200, nullable = false)
    private String jobTitle;

    @Column(name = "JOB_CATEGORY", length = 30, nullable = false)
    private String jobCategory;

    @Column(name = "IS_PRIMARY", columnDefinition = "NUMBER(1,0)", nullable = false)
    private Boolean isPrimary;

    @Column(name = "START_DATE", nullable = false)
    private LocalDate startDate;

    @Column(name = "END_DATE")
    private LocalDate endDate;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;

    @Column(name = "CREATED_BY")
    private Long createdBy;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "UPDATED_AT", nullable = false)
    private OffsetDateTime updatedAt;
}
