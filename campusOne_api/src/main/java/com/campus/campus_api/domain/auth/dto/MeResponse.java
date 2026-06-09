package com.campus.campus_api.domain.auth.dto;

import com.campus.campus_api.domain.user.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MeResponse {
    private Long id;
    private String username;
    private String name;
    private String role;
    private String email;
    private String phone;
    private boolean isActive;

    public static MeResponse from(User user) {
        return MeResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .role(user.getRole().name())
                .email(user.getEmail())
                .phone(user.getPhone())
                .isActive(user.isEnabled())
                .build();
    }
}
