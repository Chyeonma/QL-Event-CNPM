package com.project.event.repository;

import com.project.event.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, UUID> {
    
    // Lấy danh sách đăng ký của 1 sự kiện
    List<Registration> findByEventIdOrderByRegisteredAtDesc(UUID eventId);
    
    // Lấy danh sách đăng ký của 1 sinh viên
    List<Registration> findByStudentIdOrderByRegisteredAtDesc(UUID studentId);
    
    // Kiểm tra xem sinh viên đã đăng ký sự kiện này chưa
    Optional<Registration> findByEventIdAndStudentId(UUID eventId, UUID studentId);
    
    // Đếm số lượng đăng ký hợp lệ (chưa bị CANCELLED) của 1 sự kiện
    long countByEventIdAndStatus(UUID eventId, String status);
    
    // Đếm số lượng sinh viên ĐÃ điểm danh
    long countByEventIdAndCheckedInAtIsNotNull(UUID eventId);
}
