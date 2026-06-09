package com.campus.campus_api.domain.student.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class StudentMeUpdateRequest {
    private String phone;
    private String address;
}
