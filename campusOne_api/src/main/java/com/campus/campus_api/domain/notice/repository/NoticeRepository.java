package com.campus.campus_api.domain.notice.repository;

import com.campus.campus_api.domain.notice.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    @Query("SELECT n FROM Notice n JOIN FETCH n.author a " +
           "LEFT JOIN FETCH n.department d " +
           "WHERE n.deletedAt IS NULL " +
           "AND (:category IS NULL OR n.category = :category) " +
           "AND (:departmentId IS NULL OR n.department.id = :departmentId) " +
           "ORDER BY n.isPinned DESC, n.createdAt DESC")
    Page<Notice> findAllByFilter(@Param("category") String category,
                                  @Param("departmentId") Long departmentId,
                                  Pageable pageable);

    @Query("SELECT n FROM Notice n JOIN FETCH n.author a " +
           "LEFT JOIN FETCH n.department d " +
           "WHERE n.id = :id AND n.deletedAt IS NULL")
    Optional<Notice> findByIdAndNotDeleted(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Notice n SET n.viewCount = n.viewCount + 1 WHERE n.id = :id")
    void incrementViewCount(@Param("id") Long id);
}
