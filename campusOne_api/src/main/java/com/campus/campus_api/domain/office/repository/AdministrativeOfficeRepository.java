package com.campus.campus_api.domain.office.repository;

import com.campus.campus_api.domain.office.entity.AdministrativeOffice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AdministrativeOfficeRepository extends JpaRepository<AdministrativeOffice, Long> {
    
    @Query("SELECT o FROM AdministrativeOffice o WHERE o.deletedAt IS NULL AND o.parent IS NULL")
    List<AdministrativeOffice> findAllRootOffices();
}
