package com.project.event.repository;

import com.project.event.entity.EventImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventImageRepository extends JpaRepository<EventImage, UUID> {
    // Lấy tất cả ảnh của một sự kiện, sắp xếp theo thứ tự hiển thị
    List<EventImage> findByEventIdOrderByDisplayOrderAsc(UUID eventId);
    
    // Xoá tất cả ảnh của một sự kiện
    void deleteByEventId(UUID eventId);
}
