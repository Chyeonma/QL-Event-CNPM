package com.project.event.controller;

import com.project.event.dto.EventRequest;
import com.project.event.dto.EventResponse;
import com.project.event.entity.User;
import com.project.event.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')") // Bảo vệ luồng này
public class AdminEventController {

    private final EventService eventService;

    // 1. Tạo sự kiện mới
    @PostMapping
    public ResponseEntity<EventResponse> createEvent(
            @RequestBody EventRequest request,
            @AuthenticationPrincipal User user) {
        
        EventResponse response = eventService.createEvent(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. Cập nhật sự kiện
    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable UUID id,
            @RequestBody EventRequest request) {
        
        EventResponse response = eventService.updateEvent(id, request);
        return ResponseEntity.ok(response);
    }

    // 3. Xoá sự kiện
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    // 4. Lấy chi tiết một sự kiện
    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable UUID id) {
        EventResponse response = eventService.getEventById(id);
        return ResponseEntity.ok(response);
    }

    // 5. Lấy danh sách sự kiện (Có hỗ trợ lọc theo trạng thái và tìm kiếm)
    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            return ResponseEntity.ok(eventService.searchEvents(keyword));
        }
        
        if (status != null && !status.trim().isEmpty()) {
            return ResponseEntity.ok(eventService.getEventsByStatus(status));
        }

        return ResponseEntity.ok(eventService.getAllEvents());
    }
}
