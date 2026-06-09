package com.campus.campus_api.domain.auth.service;

import com.campus.campus_api.domain.auth.dto.LoginRequest;
import com.campus.campus_api.domain.auth.dto.PasswordChangeRequest;
import com.campus.campus_api.domain.auth.dto.TokenResponse;
import com.campus.campus_api.domain.auth.entity.RefreshToken;
import com.campus.campus_api.domain.auth.repository.RefreshTokenRepository;
import com.campus.campus_api.domain.user.entity.User;
import com.campus.campus_api.domain.user.repository.UserRepository;
import com.campus.campus_api.global.exception.CustomException;
import com.campus.campus_api.global.exception.ErrorCode;
import com.campus.campus_api.global.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameAndDeletedAtIsNull(request.getUsername())
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));

        System.out.println("you here?1");

        if (!user.isEnabled()) {
            System.out.println("you here? 2");
            if (user.getLockedAt() != null) {
                System.out.println("you here? 3");
                throw new CustomException(ErrorCode.ACCOUNT_LOCKED);
            }
            throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            System.out.println("you here? 4");
            System.out.println("request.getPassword()" + request.getPassword());
            System.out.println("user.getPasswordHash()" + user.getPasswordHash());
            int failCount = user.getLoginFailCount() + 1;
            user.setLoginFailCount(failCount);
            if (failCount >= 5) {
                user.setLockedAt(OffsetDateTime.now());
            }
            userRepository.save(user);
            throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
        }

        user.setLoginFailCount(0);
        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        String accessToken = jwtProvider.createAccessToken(user.getId(), user.getUsername(), user.getRole().name());
        String refreshTokenString = jwtProvider.createRefreshToken(user.getId());

        // 기존 리프레시 토큰 삭제
        refreshTokenRepository.deleteByUserId(user.getId());

        // 새 토큰 저장
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenString)
                .expiresAt(OffsetDateTime.now().plusDays(7)) // 7일 만료
                .build();
        refreshTokenRepository.save(refreshToken);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenString)
                .user(TokenResponse.UserInfo.from(user))
                .build();
    }

    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(token -> {
                    token.revoke();
                    refreshTokenRepository.delete(token);
                });
    }

    public TokenResponse refresh(String refreshTokenString) {
        if (!jwtProvider.isValid(refreshTokenString)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }

        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenString)
                .orElseThrow(() -> new CustomException(ErrorCode.UNAUTHORIZED));

        if (!refreshToken.isValid()) {
            refreshTokenRepository.delete(refreshToken);
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }

        User user = refreshToken.getUser();
        String accessToken = jwtProvider.createAccessToken(user.getId(), user.getUsername(), user.getRole().name());

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenString) // 기존 리프레시 토큰 유지 혹은 새로 갱신 가능. 일단 유지.
                .build();
    }

    public void changePassword(User user, PasswordChangeRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
