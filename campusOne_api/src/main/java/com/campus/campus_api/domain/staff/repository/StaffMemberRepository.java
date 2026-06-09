package com.campus.campus_api.domain.staff.repository;

import com.campus.campus_api.domain.staff.entity.StaffMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StaffMemberRepository extends JpaRepository<StaffMember, Long> {

    @Query("SELECT s FROM StaffMember s JOIN FETCH s.user u JOIN FETCH s.office o " +
           "WHERE (:keyword IS NULL OR u.name LIKE %:keyword% OR s.staffNumber LIKE %:keyword%) " +
           "AND (:officeId IS NULL OR o.id = :officeId) " +
           "AND (:status IS NULL OR s.status = :status) " +
           "AND (:employmentType IS NULL OR s.employmentType = :employmentType)")
    Page<StaffMember> findAllWithFilters(@Param("keyword") String keyword,
                                         @Param("officeId") Long officeId,
                                         @Param("status") String status, 
                                         @Param("employmentType") String employmentType,
                                         Pageable pageable);
}
