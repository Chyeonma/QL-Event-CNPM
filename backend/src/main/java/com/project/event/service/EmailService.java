package com.project.event.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendPasswordEmail(String to, String fullName, String studentCode, String rawPassword) {
        String subject = "Thông tin tài khoản - Hệ thống quản lý sự kiện HVCS";
        String content = "<h3>Xin chào " + fullName + ",</h3>" +
                "<p>Tài khoản của bạn đã được tạo trên hệ thống quản lý sự kiện.</p>" +
                "<p><b>Mã sinh viên (đăng nhập):</b> " + studentCode + "</p>" +
                "<p><b>Mật khẩu:</b> " + rawPassword + "</p>" +
                "<p>Vui lòng đăng nhập và đổi mật khẩu ngay lần đầu tiên để bảo mật tài khoản.</p>" +
                "<br><p>Trân trọng,<br>Hệ thống quản lý sự kiện HVCS</p>";
        sendHtmlEmail(to, subject, content);
    }

    @Async
    public void sendPasswordChangeNotification(String to, String fullName) {
        String subject = "Cảnh báo bảo mật: Mật khẩu của bạn đã được thay đổi";
        String content = "<h3>Xin chào " + fullName + ",</h3>" +
                "<p>Mật khẩu cho tài khoản của bạn trên Hệ thống quản lý sự kiện vừa được thay đổi thành công.</p>" +
                "<p>Nếu bạn không thực hiện hành động này, vui lòng liên hệ ngay với quản trị viên để được hỗ trợ.</p>" +
                "<br><p>Trân trọng,<br>Hệ thống quản lý sự kiện HVCS</p>";
        sendHtmlEmail(to, subject, content);
    }

    @Async
    public void sendForgotPasswordEmail(String to, String fullName, String newPassword) {
        String subject = "Khôi phục mật khẩu - Hệ thống quản lý sự kiện HVCS";
        String content = "<h3>Xin chào " + fullName + ",</h3>" +
                "<p>Hệ thống đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn.</p>" +
                "<p>Mật khẩu mới của bạn là: <b>" + newPassword + "</b></p>" +
                "<p>Vui lòng đăng nhập lại với mật khẩu này và tiến hành đổi mật khẩu mới ngay lập tức.</p>" +
                "<br><p>Trân trọng,<br>Hệ thống quản lý sự kiện HVCS</p>";
        sendHtmlEmail(to, subject, content);
    }

    @Async
    public void sendLoginNotificationEmail(String to, String fullName, String time) {
        String subject = "Cảnh báo đăng nhập - Hệ thống quản lý sự kiện HVCS";
        String content = "<h3>Xin chào " + fullName + ",</h3>" +
                "<p>Tài khoản của bạn vừa được đăng nhập thành công vào lúc: <b>" + time + "</b>.</p>" +
                "<p>Nếu đây không phải là bạn, vui lòng đăng nhập ngay lập tức và tiến hành đổi mật khẩu để bảo vệ tài khoản.</p>" +
                "<br><p>Trân trọng,<br>Hệ thống quản lý sự kiện HVCS</p>";
        sendHtmlEmail(to, subject, content);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Đã gửi email thành công đến: {}", to);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email đến {}: {}", to, e.getMessage());
        }
    }
}
