package com.campus.campus_api.domain.staff.entity;

import com.campus.campus_api.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "STAFF_MEMBERS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class StaffMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false, unique = true)
    private User user;

    @Column(name = "STAFF_NUMBER", length = 20, nullable = false, unique = true)
    private String staffNumber;

    @Column(name = "HIRE_DATE", nullable = false)
    private LocalDate hireDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OFFICE_ID", nullable = false)
    private com.campus.campus_api.domain.office.entity.AdministrativeOffice office;

    @Column(name = "EMPLOYMENT_TYPE", length = 30, nullable = false)
    private String employmentType;

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;

    @Column(name = "RETIRE_DATE")
    private LocalDate retireDate;

    @Column(name = "OFFICE_PHONE", length = 30)
    private String officePhone;

    @Column(name = "OFFICE_LOCATION", length = 200)
    private String officeLocation;

    @Column(name = "BIRTH_DATE")
    private LocalDate birthDate;

    @Column(name = "ADDRESS", length = 500)
    private String address;

    @Column(name = "EMERGENCY_CONTACT", length = 100)
    private String emergencyContact;

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
}
