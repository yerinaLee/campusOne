package com.campus.campus_api.domain.course.repository;

import com.campus.campus_api.domain.course.entity.CourseSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseScheduleRepository extends JpaRepository<CourseSchedule, Long> {
}
