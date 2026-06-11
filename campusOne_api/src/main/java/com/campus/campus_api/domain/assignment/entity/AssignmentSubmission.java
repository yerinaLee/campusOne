package com.campus.campus_api.domain.assignment.entity;

import com.campus.campus_api.domain.student.entity.Student;
import com.campus.campus_api.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "ASSIGNMENT_SUBMISSIONS", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"ASSIGNMENT_ID", "STUDENT_ID"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class AssignmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ASSIGNMENT_ID", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STUDENT_ID", nullable = false)
    private Student student;

    @Lob
    @Column(name = "CONTENT")
    private String content;

    @Column(name = "FILE_NAME", length = 255)
    private String fileName;

    @Column(name = "FILE_PATH", length = 1000)
    private String filePath;

    @Column(name = "FILE_SIZE")
    private Long fileSize;

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;

    @Column(name = "SCORE", precision = 5, scale = 2)
    private BigDecimal score;

    @Lob
    @Column(name = "FEEDBACK")
    private String feedback;

    @Column(name = "SUBMITTED_AT", nullable = false)
    private OffsetDateTime submittedAt;

    @Column(name = "GRADED_AT")
    private OffsetDateTime gradedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "GRADED_BY")
    private User gradedBy;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "UPDATED_AT", nullable = false)
    private OffsetDateTime updatedAt;
}
