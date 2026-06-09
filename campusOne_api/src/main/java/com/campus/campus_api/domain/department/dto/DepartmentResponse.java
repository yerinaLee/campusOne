package com.campus.campus_api.domain.department.dto;

import com.campus.campus_api.domain.department.entity.Department;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DepartmentResponse {
    private Long id;
    private String code;
    private String name;
    private Long collegeId;
    private String collegeName;

    private String headProfessorName;
    private Integer studentCount;
    private Integer professorCount;

    public static DepartmentResponse from(Department department) {
        return DepartmentResponse.builder()
                .id(department.getId())
                .code(department.getCode())
                .name(department.getName())
                .collegeId(department.getCollege() != null ? department.getCollege().getId() : null)
                .collegeName(department.getCollege() != null ? department.getCollege().getName() : null)
                .headProfessorName(null)
                .studentCount(0)
                .professorCount(0)
                .build();
    }
}
