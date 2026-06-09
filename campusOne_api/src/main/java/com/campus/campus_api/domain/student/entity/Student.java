package com.campus.campus_api.domain.student.entity;

import com.campus.campus_api.domain.department.entity.Department;
import com.campus.campus_api.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "STUDENTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false, unique = true)
    private User user;

    @Column(name = "STUDENT_NUMBER", length = 20, nullable = false, unique = true)
    private String studentNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DEPARTMENT_ID", nullable = false)
    private Department department;

    @Column(name = "GRADE", nullable = false)
    private Integer grade;

    @Column(name = "SEMESTER", nullable = false)
    private Integer semester;

    @Column(name = "ADMISSION_YEAR", nullable = false)
    private Integer admissionYear;

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;

    @Column(name = "ADDRESS", length = 500)
    private String address;

    @Column(name = "BIRTH_DATE")
    private LocalDate birthDate;

    @Column(name = "CREATED_BY")
    private Long createdBy;

    @Column(name = "CREATED_AT", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "UPDATED_AT", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "DELETED_AT")
    private OffsetDateTime deletedAt;
}
