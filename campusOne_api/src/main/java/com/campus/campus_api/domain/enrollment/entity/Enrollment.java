package com.campus.campus_api.domain.enrollment.entity;

import com.campus.campus_api.domain.course.entity.Course;
import com.campus.campus_api.domain.student.entity.Student;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ENROLLMENTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STUDENT_ID", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COURSE_ID", nullable = false)
    private Course course;

    @Column(name = "YEAR", nullable = false)
    private Integer year;

    @Column(name = "SEMESTER", nullable = false)
    private Integer semester;

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;

    @Column(name = "ENROLLED_AT", nullable = false)
    private OffsetDateTime enrolledAt;

    @Column(name = "WITHDRAWN_AT")
    private OffsetDateTime withdrawnAt;

    @Column(name = "CREATED_BY")
    private Long createdBy;

    @Column(name = "CREATED_AT", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "UPDATED_AT", nullable = false)
    private OffsetDateTime updatedAt;
}
