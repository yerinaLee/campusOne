package com.campus.campus_api.domain.office.dto;

import com.campus.campus_api.domain.office.entity.AdministrativeOffice;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class OfficeResponse {
    private Long id;
    private String code;
    private String name;
    private String officeType;
    private Long parentId;
    private String parentName;
    private String phone;
    private String location;
    private List<OfficeResponse> children;

    public static OfficeResponse from(AdministrativeOffice office) {
        return OfficeResponse.builder()
                .id(office.getId())
                .code(office.getCode())
                .name(office.getName())
                .officeType(office.getOfficeType())
                .parentId(office.getParent() != null ? office.getParent().getId() : null)
                .parentName(office.getParent() != null ? office.getParent().getName() : null)
                .phone(office.getPhone())
                .location(office.getLocation())
                .children(office.getChildren() != null ? 
                          office.getChildren().stream().map(OfficeResponse::from).collect(Collectors.toList()) 
                          : null)
                .build();
    }
}
