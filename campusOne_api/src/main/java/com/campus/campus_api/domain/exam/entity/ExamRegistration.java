package com.campus.campus_api.domain.exam.entity;

import com.campus.campus_api.domain.student.entity.Student;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;

@Entity
@Table(name = "EXAM_REGISTRATIONS", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"EXAM_ID", "STUDENT_ID"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class ExamRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EXAM_ID", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STUDENT_ID", nullable = false)
    private Student student;

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;

    @Column(name = "IS_SPECIAL", columnDefinition = "NUMBER(1,0)", nullable = false)
    private Boolean isSpecial;

    @Column(name = "REASON", length = 500)
    private String reason;

    @Column(name = "REGISTERED_AT", nullable = false)
    private OffsetDateTime registeredAt;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "UPDATED_AT", nullable = false)
    private OffsetDateTime updatedAt;
}
