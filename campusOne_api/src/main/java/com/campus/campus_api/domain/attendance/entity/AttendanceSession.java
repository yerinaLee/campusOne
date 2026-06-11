package com.campus.campus_api.domain.attendance.entity;

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
@Table(name = "ATTENDANCE_SESSIONS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class AttendanceSession {

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

    @Column(name = "LECTURE_DATE", nullable = false)
    private LocalDate lectureDate;

    @Column(name = "START_TIME", nullable = false)
    private OffsetDateTime startTime;

    @Column(name = "END_TIME", nullable = false)
    private OffsetDateTime endTime;

    @Column(name = "LATE_THRESHOLD")
    private OffsetDateTime lateThreshold;

    @Column(name = "ACCESS_CODE", length = 6, nullable = false)
    private String accessCode;

    @Column(name = "QR_TOKEN", length = 64, nullable = false, unique = true)
    private String qrToken;

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "UPDATED_AT", nullable = false)
    private OffsetDateTime updatedAt;
}
