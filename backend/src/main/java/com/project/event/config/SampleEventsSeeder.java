package com.project.event.config;

import com.project.event.entity.*;
import com.project.event.repository.EventRepository;
import com.project.event.repository.RegistrationRepository;
import com.project.event.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SampleEventsSeeder implements CommandLineRunner {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (eventRepository.count() >= 14) {
            System.out.println("========== CSDL ĐÃ CÓ ĐỦ 14+ SỰ KIỆN ==========");
            return;
        }

        User adminUser = userRepository.findByRole("ADMIN").stream().findFirst()
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));

        // Khởi tạo 5 sinh viên mẫu
        List<User> students = new ArrayList<>();
        String[] svNames = {"Nguyễn Văn An", "Trần Thị Bình", "Lê Hoàng Cường", "Phạm Văn Duy", "Hoàng Thị Em"};
        String[] svCodes = {"B23DCCN001", "B23DCCN002", "B23DCCN003", "B23DCCN004", "B23DCCN005"};
        String[] svEmails = {"sv1@ptit.edu.vn", "sv2@ptit.edu.vn", "sv3@ptit.edu.vn", "sv4@ptit.edu.vn", "sv5@ptit.edu.vn"};

        for (int i = 0; i < 5; i++) {
            final String email = svEmails[i];
            User sv = userRepository.findByRole("STUDENT").stream()
                    .filter(u -> email.equals(u.getEmail())).findFirst()
                    .orElseGet(() -> {
                        User newSv = User.builder()
                                .studentCode(svCodes[email.charAt(2) - '1'])
                                .fullName(svNames[email.charAt(2) - '1'])
                                .email(email)
                                .classCode("D23CQCN01-B")
                                .role("STUDENT")
                                .requirePasswordChange(false)
                                .isDeleted(false)
                                .build();
                        return userRepository.save(newSv);
                    });
            students.add(sv);
        }

        LocalDateTime now = LocalDateTime.now();

        // Sự kiện 5: Hackathon
        Event ev5 = Event.builder()
                .title("Cuộc Thi Thử Thách Lập Trình PTIT Hackathon 2026")
                .description("Sân chơi công nghệ đỉnh cao dành cho các lập trình viên sinh viên.\nThi đấu liên tục 24 giờ giải quyết các bài toán thực tế từ doanh nghiệp.")
                .location("Hội Trường A1")
                .startTime(now.plusDays(1).withHour(8).withMinute(0))
                .endTime(now.plusDays(2).withHour(8).withMinute(0))
                .capacity(100).trainingPoints(15).status("PUBLISHED").createdBy(adminUser).build();
        ev5.addImage(EventImage.builder().imageUrl("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80").displayOrder(0).build());
        ev5.addTarget(EventTarget.builder().batch("D23").major("CNTT").build());
        ev5 = eventRepository.save(ev5);

        // Sự kiện 6: Talkshow Quản lý thời gian
        Event ev6 = Event.builder()
                .title("Talkshow: Kỹ Năng Quản Lý Thời Gian & Cân Bằng Cuộc Sống")
                .description("Chia sẻ phương pháp Pomodoro, quản lý công việc hiệu quả và vượt qua áp lực học tập.")
                .location("Hội Trường A2")
                .startTime(now.plusDays(2).withHour(14).withMinute(0))
                .endTime(now.plusDays(2).withHour(16).withMinute(30))
                .capacity(250).trainingPoints(5).status("PUBLISHED").createdBy(adminUser).build();
        ev6.addImage(EventImage.builder().imageUrl("https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80").displayOrder(0).build());
        ev6 = eventRepository.save(ev6);

        // Sự kiện 7: IT Job Fair
        Event ev7 = Event.builder()
                .title("Ngày Hội Việc Làm IT Job Fair 2026 & Kết Nối Doanh Nghiệp")
                .description("Gặp gỡ hơn 40 tập đoàn công nghệ lớn, phỏng vấn thử nhận CV trực tiếp và nhiều quà tặng hấp dẫn.")
                .location("Sân Vận Động Học Viện")
                .startTime(now.plusDays(3).withHour(8).withMinute(30))
                .endTime(now.plusDays(3).withHour(16).withMinute(30))
                .capacity(600).trainingPoints(10).status("PUBLISHED").createdBy(adminUser).build();
        ev7.addImage(EventImage.builder().imageUrl("https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&q=80").displayOrder(0).build());
        ev7 = eventRepository.save(ev7);

        // Sự kiện 8: Giải bóng rổ
        Event ev8 = Event.builder()
                .title("Giải Bóng Rổ Sinh Viên Các Câu Lạc Bộ Mở Rộng Cup 2026")
                .description("Giải đấu thể thao sôi động tranh cúp vô địch giữa các khoa trong toàn trường.")
                .location("Nhà Thi Đấu Thể Thao")
                .startTime(now.plusDays(4).withHour(16).withMinute(0))
                .endTime(now.plusDays(4).withHour(19).withMinute(0))
                .capacity(200).trainingPoints(12).status("PUBLISHED").createdBy(adminUser).build();
        ev8.addImage(EventImage.builder().imageUrl("https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80").displayOrder(0).build());
        ev8 = eventRepository.save(ev8);

        // Sự kiện 9: Workshop Nhiếp ảnh AI (DRAFT)
        Event ev9 = Event.builder()
                .title("Workshop: Nhiếp Ảnh Nghệ Thuật & Chỉnh Sửa Video Bằng AI")
                .description("Hướng dẫn sử dụng Generative AI để tạo kỹ xảo video và hậu kỳ ảnh chuyên nghiệp.")
                .location("Phòng Đa Phương Tiện")
                .startTime(now.plusDays(12).withHour(9).withMinute(0))
                .endTime(now.plusDays(12).withHour(11).withMinute(30))
                .capacity(120).trainingPoints(6).status("DRAFT").createdBy(adminUser).build();
        ev9.addImage(EventImage.builder().imageUrl("https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80").displayOrder(0).build());
        ev9 = eventRepository.save(ev9);

        // Sự kiện 10: MC Tài năng (DRAFT)
        Event ev10 = Event.builder()
                .title("Cuộc Thi Tìm Kiếm Tài Năng Diễn Giả & MC Sinh Viên PTIT")
                .description("Thử thách sự tự tin trước đám đông, rèn luyện giọng nói và kỹ năng dẫn chương trình.")
                .location("Hội Trường Lớn")
                .startTime(now.plusDays(15).withHour(18).withMinute(30))
                .endTime(now.plusDays(15).withHour(21).withMinute(30))
                .capacity(180).trainingPoints(8).status("DRAFT").createdBy(adminUser).build();
        ev10.addImage(EventImage.builder().imageUrl("https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80").displayOrder(0).build());
        ev10 = eventRepository.save(ev10);

        // Sự kiện 11: Hiến máu (PUBLISHED trong tuần / vừa qua)
        Event ev11 = Event.builder()
                .title("Ngày Hội Hiến Máu Nhân Đạo: Giọt Hồng Yêu Thương 2026")
                .description("Mỗi giọt máu cho đi, một cuộc đời ở lại. Hưởng ứng phong trào hiến máu toàn trường.")
                .location("Sân Trung Tâm")
                .startTime(now.minusDays(1).withHour(7).withMinute(30))
                .endTime(now.minusDays(1).withHour(11).withMinute(30))
                .capacity(400).trainingPoints(15).status("PUBLISHED").createdBy(adminUser).build();
        ev11.addImage(EventImage.builder().imageUrl("https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1200&q=80").displayOrder(0).build());
        ev11 = eventRepository.save(ev11);

        // Sự kiện 12: Seminar Bảo mật Cloud (CLOSED)
        Event ev12 = Event.builder()
                .title("Seminar: An Toàn Thông Tin & Bảo Mật Điện Toán Đám Mây")
                .description("Phân tích các lỗ hổng Zero-day trên hạ tầng AWS/Azure và cách khắc phục.")
                .location("Phòng Seminar 502")
                .startTime(now.minusDays(8).withHour(13).withMinute(30))
                .endTime(now.minusDays(8).withHour(16).withMinute(30))
                .capacity(150).trainingPoints(10).status("CLOSED").createdBy(adminUser).build();
        ev12.addImage(EventImage.builder().imageUrl("https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80").displayOrder(0).build());
        ev12 = eventRepository.save(ev12);

        // Sự kiện 13: Nghiên cứu khoa học (CLOSED)
        Event ev13 = Event.builder()
                .title("Hội Nghị Sinh Viên Nghiên Cứu Khoa Học Cấp Học Viện 2026")
                .description("Tổng kết và trao giải cho các đề tài nghiên cứu xuất sắc của sinh viên các khoa.")
                .location("Hội Trường A1")
                .startTime(now.minusDays(18).withHour(8).withMinute(0))
                .endTime(now.minusDays(18).withHour(12).withMinute(0))
                .capacity(100).trainingPoints(20).status("CLOSED").createdBy(adminUser).build();
        ev13.addImage(EventImage.builder().imageUrl("https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=1200&q=80").displayOrder(0).build());
        ev13 = eventRepository.save(ev13);

        // Sự kiện 14: CLB Tiếng Anh
        Event ev14 = Event.builder()
                .title("English Speaking Club: Global Citizen Topic Open")
                .description("Giao lưu cùng cựu du học sinh và giảng viên bản ngữ về chủ đề Công dân toàn cầu.")
                .location("Thư Viện Thông Minh")
                .startTime(now.plusDays(5).withHour(19).withMinute(0))
                .endTime(now.plusDays(5).withHour(21).withMinute(0))
                .capacity(90).trainingPoints(8).status("PUBLISHED").createdBy(adminUser).build();
        ev14.addImage(EventImage.builder().imageUrl("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80").displayOrder(0).build());
        ev14 = eventRepository.save(ev14);

        // Tạo một số lượt đăng ký & điểm danh giả lập
        createReg(ev5, students.get(0), now.minusDays(3), now.minusDays(1));
        createReg(ev5, students.get(1), now.minusDays(3), now.minusDays(1));
        createReg(ev5, students.get(2), now.minusDays(2), null);
        createReg(ev5, students.get(3), now.minusDays(2), null);

        createReg(ev6, students.get(0), now.minusDays(4), now.minusDays(2));
        createReg(ev6, students.get(1), now.minusDays(4), null);
        createReg(ev6, students.get(4), now.minusDays(1), null);

        createReg(ev7, students.get(0), now.minusDays(10), now.minusDays(3));
        createReg(ev7, students.get(1), now.minusDays(9), now.minusDays(3));
        createReg(ev7, students.get(2), now.minusDays(8), now.minusDays(3));
        createReg(ev7, students.get(3), now.minusDays(5), null);
        createReg(ev7, students.get(4), now.minusDays(5), null);

        createReg(ev11, students.get(0), now.minusDays(6), now.minusDays(1));
        createReg(ev11, students.get(2), now.minusDays(6), now.minusDays(1));
        createReg(ev11, students.get(3), now.minusDays(4), now.minusDays(1));
        createReg(ev11, students.get(4), now.minusDays(2), now.minusDays(1));

        createReg(ev12, students.get(1), now.minusDays(15), now.minusDays(8));
        createReg(ev12, students.get(2), now.minusDays(14), now.minusDays(8));

        createReg(ev13, students.get(0), now.minusDays(25), now.minusDays(18));
        createReg(ev13, students.get(3), now.minusDays(22), now.minusDays(18));
        createReg(ev13, students.get(4), now.minusDays(20), null);

        System.out.println("========== ĐÃ THÊM THÀNH CÔNG 10 SỰ KIỆN MỚI & 20+ LƯỢT ĐĂNG KÝ MẪU ==========");
    }

    private void createReg(Event event, User student, LocalDateTime regTime, LocalDateTime checkTime) {
        Registration reg = Registration.builder()
                .event(event)
                .student(student)
                .status("REGISTERED")
                .registeredAt(regTime)
                .checkedInAt(checkTime)
                .build();
        registrationRepository.save(reg);
    }
}
