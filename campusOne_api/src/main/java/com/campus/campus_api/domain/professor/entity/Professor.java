package com.campus.campus_api.domain.professor.entity;

import com.campus.campus_api.domain.department.entity.Department;
import com.campus.campus_api.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "PROFESSORS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Professor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false, unique = true)
    private User user;

    @Column(name = "PROFESSOR_NUMBER", length = 20, nullable = false, unique = true)
    private String professorNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DEPARTMENT_ID", nullable = false)
    private Department department;

    @Column(name = "POSITION", length = 50)
    private String position;

    @Column(name = "RESEARCH_FIELD", length = 200)
    private String researchField;

    @Column(name = "OFFICE_LOCATION", length = 100)
    private String officeLocation;

    @Column(name = "OFFICE_PHONE", length = 20)
    private String officePhone;

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;

    @Column(name = "HIRE_DATE")
    private LocalDate hireDate;

    @Column(name = "CREATED_BY")
    private Long createdBy;

    @Column(name = "CREATED_AT", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "UPDATED_AT", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "DELETED_AT")
    private OffsetDateTime deletedAt;
}
