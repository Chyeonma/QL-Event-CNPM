package com.project.event.repository;

import com.project.event.entity.EventTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventTargetRepository extends JpaRepository<EventTarget, UUID> {
    // Lấy các mục tiêu giới hạn của sự kiện
    List<EventTarget> findByEventId(UUID eventId);
    
    // Xóa tất cả mục tiêu của một sự kiện
    void deleteByEventId(UUID eventId);
}
