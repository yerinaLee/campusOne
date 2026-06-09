package com.campus.campus_api.domain.notice.entity;

import com.campus.campus_api.domain.course.entity.Course;
import com.campus.campus_api.domain.department.entity.Department;
import com.campus.campus_api.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "NOTICES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "TITLE", length = 500, nullable = false)
    private String title;

    @Lob
    @Column(name = "CONTENT", columnDefinition = "CLOB", nullable = false)
    private String content;

    @Column(name = "CATEGORY", length = 30, nullable = false)
    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AUTHOR_ID", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DEPARTMENT_ID")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COURSE_ID")
    private Course course;

    @Column(name = "IS_PINNED", columnDefinition = "NUMBER(1,0)", nullable = false)
    private Boolean isPinned;

    @Column(name = "VIEW_COUNT", nullable = false)
    private Long viewCount;

    @Column(name = "CREATED_BY")
    private Long createdBy;

    @Column(name = "CREATED_AT", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "UPDATED_AT", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "DELETED_AT")
    private OffsetDateTime deletedAt;
}
