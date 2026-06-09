package com.campus.campus_api.domain.office.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class OfficeUpdateRequest {
    @NotBlank
    private String name;
    private Long parentId;
    private String phone;
    private String location;
}
