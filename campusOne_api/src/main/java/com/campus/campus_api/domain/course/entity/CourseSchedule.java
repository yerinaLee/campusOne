package com.campus.campus_api.domain.course.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "COURSE_SCHEDULES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COURSE_ID", nullable = false)
    private Course course;

    @Column(name = "DAY_OF_WEEK", nullable = false)
    private Integer dayOfWeek;

    @Column(name = "PERIOD_START", nullable = false)
    private Integer periodStart;

    @Column(name = "PERIOD_END", nullable = false)
    private Integer periodEnd;

    @Column(name = "CLASSROOM", length = 100)
    private String classroom;
}
