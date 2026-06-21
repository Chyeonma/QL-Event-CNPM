package com.project.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

public interface AuthDto {

    // 1. DTO cho Login
    record LoginRequest(
            @NotBlank(message = "Tài khoản (Email hoặc Mã sinh viên) không được để trống") 
            String identifier,

            String password
    ) {}

    // 2. DTO cho Token Response
    @Builder
    record AuthResponse(
            String accessToken,
            String refreshToken,
            String tokenType,
            String role,
            String fullName,
            boolean requirePasswordChange
    ) {
        // Compact constructor để xử lý giá trị mặc định (thay thế cho @Builder.Default)
        public AuthResponse {
            if (tokenType == null) {
                tokenType = "Bearer";
            }
        }
    }

    // 3. DTO cho Refresh Token
    record RefreshTokenRequest(
            @NotBlank(message = "Refresh token không được để trống") 
            String refreshToken
    ) {}

    // 4. DTO cho Đổi mật khẩu
    record ChangePasswordRequest(
            @NotBlank(message = "Mật khẩu hiện tại không được để trống") 
            String currentPassword,

            @NotBlank(message = "Mật khẩu mới không được để trống")
            @Size(min = 8, message = "Mật khẩu mới phải có ít nhất 8 ký tự") 
            String newPassword
    ) {}

    // 5. DTO cho Quên mật khẩu
    record ForgotPasswordRequest(
            @NotBlank(message = "Email không được để trống")
            String email
    ) {}

    // 6. DTO cho Google Login
    record GoogleLoginRequest(
            @NotBlank(message = "Token từ Google không được để trống")
            String idToken
    ) {}

    // 7. DTO cho User Info
    @Builder
    record UserInfoResponse(
            java.util.UUID id,
            String studentCode,
            String email,
            String fullName,
            String role,
            String avatarUrl,
            String classCode,
            String major,
            String batch,
            Boolean requirePasswordChange
    ) {}
}