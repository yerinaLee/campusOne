package com.campus.campus_api.domain.course.entity;

import com.campus.campus_api.domain.department.entity.Department;
import com.campus.campus_api.domain.professor.entity.Professor;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "COURSES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "COURSE_CODE", length = 20, nullable = false, unique = true)
    private String courseCode;

    @Column(name = "NAME", length = 200, nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DEPARTMENT_ID", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROFESSOR_ID", nullable = false)
    private Professor professor;

    @Column(name = "CREDIT", nullable = false)
    private Integer credit;

    @Column(name = "YEAR", nullable = false)
    private Integer year;

    @Column(name = "SEMESTER", nullable = false)
    private Integer semester;

    @Column(name = "MAX_ENROLLMENT", nullable = false)
    private Integer maxEnrollment;

    @Column(name = "CURRENT_ENROLLMENT", nullable = false)
    private Integer currentEnrollment;

    @Version
    @Column(name = "VERSION_NO", nullable = false)
    private Long versionNo;

    @Column(name = "CLASSROOM", length = 100)
    private String classroom;

    @Column(name = "COURSE_TYPE", length = 30, nullable = false)
    private String courseType;

    @Lob
    @Column(name = "DESCRIPTION", columnDefinition = "CLOB")
    private String description;

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;

    @Column(name = "CREATED_BY")
    private Long createdBy;

    @Column(name = "CREATED_AT", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "UPDATED_AT", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "DELETED_AT")
    private OffsetDateTime deletedAt;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CourseSchedule> schedules = new ArrayList<>();
}
