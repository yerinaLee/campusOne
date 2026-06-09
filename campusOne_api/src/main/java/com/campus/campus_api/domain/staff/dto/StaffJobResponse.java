package com.campus.campus_api.domain.staff.dto;

import com.campus.campus_api.domain.staff.entity.StaffJob;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class StaffJobResponse {
    private Long id;
    private Long officeId;
    private String officeName;
    private Long positionId;
    private String positionName;
    private Boolean isPrimary;
    private LocalDate startDate;
    private LocalDate endDate;

    public static StaffJobResponse from(StaffJob job) {
        return StaffJobResponse.builder()
                .id(job.getId())
                .officeId(job.getOffice().getId())
                .officeName(job.getOffice().getName())
                .positionId(job.getJobPosition().getId())
                .positionName(job.getJobPosition().getName())
                .isPrimary(job.getIsPrimary())
                .startDate(job.getStartDate())
                .endDate(job.getEndDate())
                .build();
    }
}
