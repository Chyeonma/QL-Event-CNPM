package com.project.event.config;

import com.project.event.entity.*;
import com.project.event.repository.EventRepository;
import com.project.event.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Kiểm tra xem sự kiện mẫu cụ thể đã tồn tại chưa (tránh bị chặn khi CSDL đã có sự kiện khác)
        boolean alreadySeeded = eventRepository.findAll().stream()
                .anyMatch(e -> e.getTitle() != null && e.getTitle().contains("EduCampus 2026"));
                
        if (alreadySeeded) {
            System.out.println("========== DỮ LIỆU MẪU ĐÃ TỒN TẠI TRONG CSDL ==========");
            return;
        }

        User adminUser = userRepository.findByRole("ADMIN").stream().findFirst()
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));

        // Tạo sự kiện mẫu 1: Đêm nhạc Chào Tân Sinh Viên
        Event event1 = Event.builder()
                .title("Đêm Nhạc Hội Tri Ân & Chào Tân Sinh Viên EduCampus 2026")
                .description("Chương trình âm nhạc nghệ thuật đặc sắc với sự góp mặt của nhiều câu lạc bộ trong trường cùng các khách mời bí ẩn.\n\nThời gian giao lưu: Từ 18h30 đến 21h30.\nĐịa điểm: Sân trung tâm Học viện.\nSinh viên tham gia được tích lũy điểm rèn luyện tiêu chí hoạt động phong trào văn hóa nghệ thuật.")
                .location("Sân Trung Tâm PTIT")
                .startTime(LocalDateTime.now().plusDays(5).withHour(18).withMinute(30))
                .endTime(LocalDateTime.now().plusDays(5).withHour(21).withMinute(30))
                .capacity(500)
                .trainingPoints(10)
                .status("PUBLISHED")
                .createdBy(adminUser)
                .build();

        EventImage img1_1 = EventImage.builder().imageUrl("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80").displayOrder(0).build();
        EventImage img1_2 = EventImage.builder().imageUrl("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80").displayOrder(1).build();
        event1.addImage(img1_1);
        event1.addImage(img1_2);
        eventRepository.save(event1);

        // Tạo sự kiện mẫu 2: Giải chạy bộ PTIT Marathon
        Event event2 = Event.builder()
                .title("Giải Chạy Bộ PTIT Marathon 2026: Bước Chạy Thanh Xuân")
                .description("Hoạt động thể thao rèn luyện sức khỏe hưởng ứng phong trào Sinh viên 5 tốt.\nCự ly đăng ký: 5km vòng quanh khuôn viên học viện và khu vực lân cận.\nBan tổ chức chuẩn bị sẵn nước uống, bib chạy và huy hiệu hoàn thành cho toàn bộ vận động viên tham dự.")
                .location("Sân Vận Động PTIT")
                .startTime(LocalDateTime.now().plusDays(10).withHour(6).withMinute(0))
                .endTime(LocalDateTime.now().plusDays(10).withHour(9).withMinute(0))
                .capacity(300)
                .trainingPoints(15)
                .status("PUBLISHED")
                .createdBy(adminUser)
                .build();
        EventImage img2_1 = EventImage.builder().imageUrl("https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&q=80").displayOrder(0).build();
        event2.addImage(img2_1);
        EventTarget tgt2 = EventTarget.builder().batch("D23").major("CNTT").build();
        event2.addTarget(tgt2);
        eventRepository.save(event2);

        // Tạo sự kiện mẫu 3: Seminar AI & LLMs
        Event event3 = Event.builder()
                .title("Hội Thảo Công Nghệ: Ứng Dụng AI Gen & LLMs Trong Phát Triển Phần Mềm")
                .description("Cuộc gặp gỡ chuyên sâu cùng các kỹ sư kiến trúc hệ thống đến từ các tập đoàn công nghệ hàng đầu.\nNội dung chính:\n1. Phân tích kiến trúc Agentic Coding hiện đại.\n2. Thực hành tối ưu hóa Prompt và RAG trong luồng phát triển ứng dụng.\n3. Q&A trực tiếp cùng diễn giả khách mời.")
                .location("Hội Trường A1")
                .startTime(LocalDateTime.now().plusDays(3).withHour(8).withMinute(30))
                .endTime(LocalDateTime.now().plusDays(3).withHour(11).withMinute(30))
                .capacity(150)
                .trainingPoints(8)
                .status("PUBLISHED")
                .createdBy(adminUser)
                .build();
        EventImage img3_1 = EventImage.builder().imageUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80").displayOrder(0).build();
        event3.addImage(img3_1);
        eventRepository.save(event3);

        // Tạo sự kiện mẫu 4: Mùa Hè Xanh
        Event event4 = Event.builder()
                .title("Chiến Dịch Tình Nguyện Mùa Hè Xanh 2026: Chung Tay Vì Cộng Đồng")
                .description("Hoạt động tình nguyện hè hỗ trợ các địa phương vùng sâu vùng xa sửa chữa trường học và phổ cập kiến thức tin học cho trẻ em em nhỏ.\nYêu cầu: Sinh viên có sức khỏe tốt, nhiệt tình, có trách nhiệm và cam kết tham gia trọn vẹn thời gian chiến dịch.")
                .location("Khu Vực Ngoại Thành")
                .startTime(LocalDateTime.now().plusDays(20).withHour(7).withMinute(0))
                .endTime(LocalDateTime.now().plusDays(25).withHour(17).withMinute(0))
                .capacity(80)
                .trainingPoints(20)
                .status("PUBLISHED")
                .createdBy(adminUser)
                .build();
        EventImage img4_1 = EventImage.builder().imageUrl("https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&q=80").displayOrder(0).build();
        event4.addImage(img4_1);
        eventRepository.save(event4);

        System.out.println("========== ĐÃ KHỞI TẠO THÀNH CÔNG 4 SỰ KIỆN MẪU PUBLISHED ==========");
    }
}
