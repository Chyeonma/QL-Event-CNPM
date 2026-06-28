package com.project.event.service;

import com.project.event.dto.AuthDto;
import com.project.event.entity.RefreshToken;
import com.project.event.entity.User;
import com.project.event.repository.UserRepository;
import com.project.event.security.JwtTokenProvider;
import com.project.event.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private RefreshTokenService refreshTokenService;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User activeUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        activeUser = User.builder()
                .id(userId)
                .studentCode("B21DCCN001")
                .email("student@ptit.edu.vn")
                .fullName("Nguyen Van A")
                .passwordHash("$2a$10$hashedpassword")
                .role("STUDENT")
                .requirePasswordChange(false)
                .isDeleted(false)
                .build();
    }

    // ==================== LOGIN ====================

    @Test
    @DisplayName("Login - success with valid credentials")
    void login_success() {
        AuthDto.LoginRequest req = new AuthDto.LoginRequest("B21DCCN001", "password123");
        RefreshToken refreshToken = RefreshToken.builder()
                .token("refresh-token-value")
                .user(activeUser)
                .build();

        when(userRepository.findByIdentifier("B21DCCN001")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("password123", activeUser.getPasswordHash())).thenReturn(true);
        when(jwtTokenProvider.generateToken(userId, "STUDENT")).thenReturn("access-token");
        when(refreshTokenService.createRefreshToken(activeUser)).thenReturn(refreshToken);

        AuthDto.AuthResponse response = authService.login(req);

        assertNotNull(response);
        assertEquals("access-token", response.accessToken());
        assertEquals("refresh-token-value", response.refreshToken());
        assertEquals("STUDENT", response.role());
        assertEquals("Nguyen Van A", response.fullName());
        assertFalse(response.requirePasswordChange());
    }

    @Test
    @DisplayName("Login - user not found throws BadCredentialsException")
    void login_userNotFound_throwsBadCredentials() {
        AuthDto.LoginRequest req = new AuthDto.LoginRequest("unknown", "pass");
        when(userRepository.findByIdentifier("unknown")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }

    @Test
    @DisplayName("Login - wrong password throws BadCredentialsException")
    void login_wrongPassword_throwsBadCredentials() {
        AuthDto.LoginRequest req = new AuthDto.LoginRequest("B21DCCN001", "wrongpass");

        when(userRepository.findByIdentifier("B21DCCN001")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("wrongpass", activeUser.getPasswordHash())).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }

    @Test
    @DisplayName("Login - first login (no password hash) sends email and throws")
    void login_firstLogin_sendsEmailAndThrows() {
        User noPasswordUser = User.builder()
                .id(userId)
                .studentCode("B21DCCN001")
                .email("student@ptit.edu.vn")
                .fullName("Nguyen Van A")
                .passwordHash(null)
                .role("STUDENT")
                .requirePasswordChange(true)
                .isDeleted(false)
                .build();
        AuthDto.LoginRequest req = new AuthDto.LoginRequest("B21DCCN001", "anypass");

        when(userRepository.findByIdentifier("B21DCCN001")).thenReturn(Optional.of(noPasswordUser));
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$newhashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(noPasswordUser);

        BadCredentialsException ex = assertThrows(BadCredentialsException.class, () -> authService.login(req));
        assertTrue(ex.getMessage().contains("email"));
        verify(emailService).sendPasswordEmail(eq("student@ptit.edu.vn"), eq("Nguyen Van A"), eq("B21DCCN001"), anyString());
    }

    @Test
    @DisplayName("Login - empty password throws BadCredentialsException")
    void login_emptyPassword_throwsBadCredentials() {
        AuthDto.LoginRequest req = new AuthDto.LoginRequest("B21DCCN001", "");

        when(userRepository.findByIdentifier("B21DCCN001")).thenReturn(Optional.of(activeUser));

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }

    // ==================== REFRESH TOKEN ====================

    @Test
    @DisplayName("refreshToken - rotates token and returns new access token")
    void refreshToken_success() {
        AuthDto.RefreshTokenRequest req = new AuthDto.RefreshTokenRequest("old-refresh-token");
        RefreshToken oldToken = RefreshToken.builder().token("old-refresh-token").user(activeUser).build();
        RefreshToken newToken = RefreshToken.builder().token("new-refresh-token").user(activeUser).build();

        when(refreshTokenService.verifyRefreshToken("old-refresh-token")).thenReturn(oldToken);
        when(refreshTokenService.rotateRefreshToken(oldToken)).thenReturn(newToken);
        when(jwtTokenProvider.generateToken(userId, "STUDENT")).thenReturn("new-access-token");

        AuthDto.AuthResponse response = authService.refreshToken(req);

        assertEquals("new-access-token", response.accessToken());
        assertEquals("new-refresh-token", response.refreshToken());
    }

    // ==================== LOGOUT ====================

    @Test
    @DisplayName("logout - revokes refresh token")
    void logout_revokesToken() {
        AuthDto.RefreshTokenRequest req = new AuthDto.RefreshTokenRequest("some-refresh-token");
        doNothing().when(refreshTokenService).revokeByToken("some-refresh-token");

        authService.logout(req);

        verify(refreshTokenService).revokeByToken("some-refresh-token");
    }

    // ==================== CHANGE PASSWORD ====================

    @Test
    @DisplayName("changePassword - success updates hash and revokes all tokens")
    void changePassword_success() {
        AuthDto.ChangePasswordRequest req = new AuthDto.ChangePasswordRequest("oldpass", "newpass123");

        when(userRepository.findById(userId)).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("oldpass", activeUser.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.encode("newpass123")).thenReturn("$2a$10$newhashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(activeUser);

        authService.changePassword(userId, req);

        verify(userRepository).save(activeUser);
        verify(refreshTokenService).revokeAllByUserId(userId);
        verify(emailService).sendPasswordChangeNotification(eq("student@ptit.edu.vn"), eq("Nguyen Van A"));
        assertFalse(activeUser.getRequirePasswordChange());
    }

    @Test
    @DisplayName("changePassword - wrong current password throws BadCredentialsException")
    void changePassword_wrongCurrentPassword_throws() {
        AuthDto.ChangePasswordRequest req = new AuthDto.ChangePasswordRequest("wrongold", "newpass123");

        when(userRepository.findById(userId)).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("wrongold", activeUser.getPasswordHash())).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.changePassword(userId, req));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("changePassword - user not found throws RuntimeException")
    void changePassword_userNotFound_throws() {
        AuthDto.ChangePasswordRequest req = new AuthDto.ChangePasswordRequest("pass", "newpass");
        UUID unknownId = UUID.randomUUID();

        when(userRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.changePassword(unknownId, req));
    }

    // ==================== FORGOT PASSWORD ====================

    @Test
    @DisplayName("forgotPassword - generates new password and sends email")
    void forgotPassword_success() {
        AuthDto.ForgotPasswordRequest req = new AuthDto.ForgotPasswordRequest("student@ptit.edu.vn");

        when(userRepository.findByEmailAndIsDeletedFalse("student@ptit.edu.vn")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$newhashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(activeUser);

        authService.forgotPassword(req);

        assertTrue(activeUser.getRequirePasswordChange());
        verify(userRepository).save(activeUser);
        verify(refreshTokenService).revokeAllByUserId(userId);
        verify(emailService).sendForgotPasswordEmail(eq("student@ptit.edu.vn"), eq("Nguyen Van A"), anyString());
    }

    @Test
    @DisplayName("forgotPassword - email not found throws RuntimeException")
    void forgotPassword_emailNotFound_throws() {
        AuthDto.ForgotPasswordRequest req = new AuthDto.ForgotPasswordRequest("notexist@ptit.edu.vn");

        when(userRepository.findByEmailAndIsDeletedFalse("notexist@ptit.edu.vn")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.forgotPassword(req));
        verify(emailService, never()).sendForgotPasswordEmail(any(), any(), any());
    }
}
