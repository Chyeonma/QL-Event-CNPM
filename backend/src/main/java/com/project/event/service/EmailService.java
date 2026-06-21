package com.project.event.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendPasswordEmail(String to, String fullName, String studentCode, String rawPassword) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Thông tin tài khoản - Hệ thống quản lý sự kiện HVCS");
            message.setText(
                "Xin chào " + fullName + ",\n\n" +
                "Tài khoản của bạn đã được tạo trên hệ thống quản lý sự kiện.\n\n" +
                "Mã sinh viên (đăng nhập): " + studentCode + "\n" +
                "Mật khẩu: " + rawPassword + "\n\n" +
                "Vui lòng đăng nhập và đổi mật khẩu ngay lần đầu tiên.\n\n" +
                "Trân trọng,\n" +
                "Hệ thống quản lý sự kiện HVCS"
            );
            mailSender.send(message);
            log.info("Đã gửi email mật khẩu cho: {}", to);
        } catch (Exception e) {
            log.error("Lỗi gửi email cho {}: {}", to, e.getMessage());
        }
    }
}
