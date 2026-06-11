package com.campus.campus_api.domain.attendance.repository;

import com.campus.campus_api.domain.attendance.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findBySessionId(Long sessionId);
    Optional<AttendanceRecord> findBySessionIdAndStudentId(Long sessionId, Long studentId);

    @Query("SELECT r FROM AttendanceRecord r JOIN r.session s WHERE r.student.id = :studentId AND s.course.id = :courseId ORDER BY s.lectureDate ASC")
    List<AttendanceRecord> findByStudentIdAndCourseId(@Param("studentId") Long studentId, @Param("courseId") Long courseId);

    @Query("SELECT r FROM AttendanceRecord r JOIN r.session s WHERE s.course.id = :courseId ORDER BY s.lectureDate ASC")
    List<AttendanceRecord> findByCourseId(@Param("courseId") Long courseId);
    
    @Query("SELECT COUNT(r) FROM AttendanceRecord r JOIN r.session s WHERE s.course.id = :courseId AND r.student.id = :studentId AND r.status = :status")
    long countByCourseIdAndStudentIdAndStatus(@Param("courseId") Long courseId, @Param("studentId") Long studentId, @Param("status") String status);
    
    @Query("SELECT COUNT(s) FROM AttendanceSession s WHERE s.course.id = :courseId")
    long countSessionsByCourseId(@Param("courseId") Long courseId);
}
