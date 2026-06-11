package com.campus.campus_api.domain.assignment.entity;

import com.campus.campus_api.domain.course.entity.Course;
import com.campus.campus_api.domain.professor.entity.Professor;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "ASSIGNMENTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COURSE_ID", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROFESSOR_ID", nullable = false)
    private Professor professor;

    @Column(name = "TITLE", length = 500, nullable = false)
    private String title;

    @Lob
    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "DUE_DATE", nullable = false)
    private OffsetDateTime dueDate;

    @Column(name = "MAX_SCORE", precision = 5, scale = 2, nullable = false)
    private BigDecimal maxScore;

    @Column(name = "ALLOW_LATE_SUBMIT", columnDefinition = "NUMBER(1,0)", nullable = false)
    private Boolean allowLateSubmit;

    @Column(name = "IS_VISIBLE", columnDefinition = "NUMBER(1,0)", nullable = false)
    private Boolean isVisible;

    @Column(name = "SUBMISSION_TYPE", length = 20, nullable = false)
    private String submissionType;

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "UPDATED_AT", nullable = false)
    private OffsetDateTime updatedAt;
}
