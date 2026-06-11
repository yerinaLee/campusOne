package com.campus.campus_api.domain.exam.entity;

import com.campus.campus_api.domain.course.entity.Course;
import com.campus.campus_api.domain.professor.entity.Professor;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "EXAMS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Exam {

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

    @Column(name = "EXAM_TYPE", length = 20, nullable = false)
    private String examType;

    @Column(name = "TITLE", length = 500, nullable = false)
    private String title;

    @Column(name = "EXAM_DATE", nullable = false)
    private LocalDate examDate;

    @Column(name = "START_TIME", nullable = false)
    private OffsetDateTime startTime;

    @Column(name = "END_TIME", nullable = false)
    private OffsetDateTime endTime;

    @Column(name = "ROOM", length = 100)
    private String room;

    @Column(name = "MAX_STUDENTS")
    private Integer maxStudents;

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;

    @Column(name = "DESCRIPTION", length = 1000)
    private String description;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "UPDATED_AT", nullable = false)
    private OffsetDateTime updatedAt;
}
