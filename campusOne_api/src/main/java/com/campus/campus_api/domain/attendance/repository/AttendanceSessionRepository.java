package com.campus.campus_api.domain.attendance.repository;

import com.campus.campus_api.domain.attendance.entity.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    Optional<AttendanceSession> findByQrToken(String qrToken);
    List<AttendanceSession> findByCourseIdOrderByLectureDateDescStartTimeDesc(Long courseId);
}
