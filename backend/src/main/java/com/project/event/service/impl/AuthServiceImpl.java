package com.project.event.service.impl;

import com.project.event.dto.AuthDto;
import com.project.event.entity.RefreshToken;
import com.project.event.entity.User;
import com.project.event.repository.UserRepository;
import com.project.event.security.JwtTokenProvider;
import com.project.event.service.AuthService;
import com.project.event.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    @Override
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByStudentCodeAndIsDeletedFalse(request.studentCode())
                .orElseThrow(() -> new BadCredentialsException("Mã sinh viên hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Mã sinh viên hoặc mật khẩu không đúng");
        }

        String accessToken = jwtTokenProvider.generateToken(user.getId(), user.getRole());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthDto.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .role(user.getRole())
                .fullName(user.getFullName())
                .requirePasswordChange(user.getRequirePasswordChange())
                .build();
    }

    @Override
    public AuthDto.AuthResponse refreshToken(AuthDto.RefreshTokenRequest request) {
        // Thay getRefreshToken() bằng refreshToken()
        RefreshToken oldToken = refreshTokenService.verifyRefreshToken(request.refreshToken());
        RefreshToken newToken = refreshTokenService.rotateRefreshToken(oldToken);
        User user = newToken.getUser();

        String accessToken = jwtTokenProvider.generateToken(user.getId(), user.getRole());

        return AuthDto.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newToken.getToken())
                .tokenType("Bearer")
                .role(user.getRole())
                .fullName(user.getFullName())
                .requirePasswordChange(user.getRequirePasswordChange())
                .build();
    }

    @Override
    public void logout(AuthDto.RefreshTokenRequest request) {
        refreshTokenService.revokeByToken(request.refreshToken());
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, AuthDto.ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Thay getCurrentPassword() bằng currentPassword()
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Mật khẩu hiện tại không đúng");
        }

        // Thay getNewPassword() bằng newPassword()
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setRequirePasswordChange(false);
        userRepository.save(user);
    }
}