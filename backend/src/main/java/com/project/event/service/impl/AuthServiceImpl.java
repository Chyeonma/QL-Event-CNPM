package com.project.event.service.impl;

import com.project.event.dto.AuthDto;
import com.project.event.entity.RefreshToken;
import com.project.event.entity.User;
import com.project.event.repository.UserRepository;
import com.project.event.security.JwtTokenProvider;
import com.project.event.service.AuthService;
import com.project.event.service.EmailService;
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
    private final EmailService emailService;

    @Override
    @Transactional
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByIdentifier(request.identifier())
                .orElseThrow(() -> new BadCredentialsException("Tài khoản hoặc mật khẩu không đúng"));

        // Kiểm tra đăng nhập lần đầu (chưa có mật khẩu trong DB)
        if (user.getPasswordHash() == null || user.getPasswordHash().trim().isEmpty()) {
            String newPassword = UUID.randomUUID().toString().substring(0, 8);
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            user.setRequirePasswordChange(true);
            userRepository.save(user);

            emailService.sendPasswordEmail(user.getEmail(), user.getFullName(), user.getStudentCode(), newPassword);
            throw new BadCredentialsException("Mật khẩu đăng nhập khởi tạo đã được gửi về email của bạn. Vui lòng kiểm tra email và đăng nhập lại.");
        }

        if (request.password() == null || request.password().trim().isEmpty() || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Tài khoản hoặc mật khẩu không đúng");
        }

        String accessToken = jwtTokenProvider.generateToken(user.getId(), user.getRole());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        // Gửi thông báo đăng nhập
        String time = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        emailService.sendLoginNotificationEmail(user.getEmail(), user.getFullName(), time);

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

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Mật khẩu hiện tại không đúng");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setRequirePasswordChange(false);
        userRepository.save(user);

        refreshTokenService.revokeAllByUserId(userId);
        
        // Gửi email thông báo
        emailService.sendPasswordChangeNotification(user.getEmail(), user.getFullName());
    }

    @Override
    @Transactional
    public void forgotPassword(AuthDto.ForgotPasswordRequest request) {
        User user = userRepository.findByEmailAndIsDeletedFalse(request.email())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này"));

        // Tạo mật khẩu ngẫu nhiên 8 ký tự
        String newPassword = UUID.randomUUID().toString().substring(0, 8);
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setRequirePasswordChange(true); // Ép đổi mật khẩu sau khi đăng nhập lại
        userRepository.save(user);

        refreshTokenService.revokeAllByUserId(user.getId());
        
        // Gửi mật khẩu mới qua email
        emailService.sendForgotPasswordEmail(user.getEmail(), user.getFullName(), newPassword);
    }
}