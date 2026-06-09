package com.campus.campus_api.domain.grade.entity;

import com.campus.campus_api.domain.enrollment.entity.Enrollment;
import com.campus.campus_api.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "GRADES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ENROLLMENT_ID", nullable = false, unique = true)
    private Enrollment enrollment;

    @Column(name = "LETTER_GRADE", length = 5)
    private String letterGrade;

    @Column(name = "SCORE", precision = 5, scale = 2)
    private BigDecimal score;

    @Column(name = "GRADE_POINTS", precision = 3, scale = 2)
    private BigDecimal gradePoints;

    @Column(name = "IS_PASS_FAIL", columnDefinition = "NUMBER(1,0)", nullable = false)
    private Boolean isPassFail;

    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;

    @Column(name = "SUBMITTED_AT")
    private OffsetDateTime submittedAt;

    @Column(name = "CONFIRMED_AT")
    private OffsetDateTime confirmedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONFIRMED_BY")
    private User confirmedBy;

    @Column(name = "REMARK", length = 1000)
    private String remark;

    @Column(name = "CREATED_BY")
    private Long createdBy;

    @Column(name = "CREATED_AT", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "UPDATED_AT", nullable = false)
    private OffsetDateTime updatedAt;
}
