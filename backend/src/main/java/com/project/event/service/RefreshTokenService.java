package com.project.event.service;

import com.project.event.entity.RefreshToken;
import com.project.event.entity.User;
import com.project.event.exception.TokenRefreshException;
import com.project.event.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-expiration}")
    private long refreshTokenExpiration;

    @Transactional
    public RefreshToken createRefreshToken(User user) {
        refreshTokenRepository.revokeAllByUserId(user.getId());

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenExpiration))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public RefreshToken verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenRefreshException("Refresh token không tồn tại"));

        if (refreshToken.getRevoked()) {
            // Nâng cấp 1: Token Reuse Detection
            // Nếu phát hiện dùng lại thẻ đã thu hồi -> Khóa TOÀN BỘ các thẻ của User này để văng cả Hacker lẫn User
            refreshTokenRepository.revokeAllByUserId(refreshToken.getUser().getId());
            throw new TokenRefreshException("Phát hiện truy cập bất thường! Toàn bộ phiên đăng nhập đã bị vô hiệu hóa.");
        }

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new TokenRefreshException("Refresh token đã hết hạn");
        }

        return refreshToken;
    }

    @Transactional
    public RefreshToken rotateRefreshToken(RefreshToken oldToken) {
        oldToken.setRevoked(true);
        refreshTokenRepository.save(oldToken);

        RefreshToken newToken = RefreshToken.builder()
                .user(oldToken.getUser())
                .token(UUID.randomUUID().toString())
                // Nâng cấp 2: Hạn chót tuyệt đối (Absolute Expiration)
                // Kế thừa lại đúng hạn sử dụng của thẻ cũ thay vì cộng thêm 7 ngày
                .expiryDate(oldToken.getExpiryDate())
                .revoked(false)
                .build();

        return refreshTokenRepository.save(newToken);
    }

    @Transactional
    public void revokeByToken(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }
}
