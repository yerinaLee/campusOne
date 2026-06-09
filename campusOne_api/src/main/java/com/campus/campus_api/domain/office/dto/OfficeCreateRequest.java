package com.campus.campus_api.domain.office.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class OfficeCreateRequest {
    @NotBlank
    private String code;
    @NotBlank
    private String name;
    @NotBlank
    private String officeType;
    private Long parentId;
    private String phone;
    private String location;
}
