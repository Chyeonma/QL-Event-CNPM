package com.project.event.repository;

import com.project.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {
    
    // Lấy các sự kiện theo trạng thái (PUBLISHED, DRAFT, CLOSED)
    List<Event> findByStatusOrderByStartTimeDesc(String status);
    
    // Tìm kiếm sự kiện theo tên hoặc địa điểm
    @Query("SELECT e FROM Event e WHERE LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(e.location) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY e.startTime DESC")
    List<Event> searchEvents(String keyword);
    
    // Lấy tất cả sự kiện sắp xếp mới nhất
    List<Event> findAllByOrderByStartTimeDesc();
}
