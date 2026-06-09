package com.campus.campus_api.global.init;

import com.campus.campus_api.domain.user.entity.User;
import com.campus.campus_api.domain.user.entity.UserRole;
import com.campus.campus_api.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .name("관리자")
                    .email("admin@campus.ac.kr")
                    .role(UserRole.ADMIN)
                    .isActive(true)
                    .loginFailCount(0)
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();
            userRepository.save(admin);
            log.info("✅ Admin 계정 자동 생성 완료 - username: admin / password: admin123");
        } else {
            log.info("ℹ️ Admin 계정이 이미 존재합니다.");
        }
    }
}
