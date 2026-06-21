package com.project.event.service;

import com.project.event.dto.AuthDto;

import java.util.UUID;

public interface AuthService {
    AuthDto.AuthResponse login(AuthDto.LoginRequest request);
    AuthDto.AuthResponse refreshToken(AuthDto.RefreshTokenRequest request);
    void logout(AuthDto.RefreshTokenRequest request);
    void changePassword(UUID userId, AuthDto.ChangePasswordRequest request);
    void forgotPassword(AuthDto.ForgotPasswordRequest request);
    AuthDto.AuthResponse googleLogin(AuthDto.GoogleLoginRequest request);
}
