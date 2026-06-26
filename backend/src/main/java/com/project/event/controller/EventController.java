package com.project.event.controller;

import com.project.event.dto.MessageResponse;
import com.project.event.dto.PublicEventResponse;
import com.project.event.dto.StudentRegistrationResponse;
import com.project.event.entity.User;
import com.project.event.service.PublicEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final PublicEventService publicEventService;

    // 1. Lấy danh sách sự kiện đã công bố (Công khai)
    @GetMapping
    public ResponseEntity<List<PublicEventResponse>> getPublishedEvents(
            @RequestParam(required = false) String keyword,
            @AuthenticationPrincipal User user) {
        UUID userId = (user != null) ? user.getId() : null;
        return ResponseEntity.ok(publicEventService.getPublishedEvents(keyword, userId));
    }

    // 2. Xem chi tiết sự kiện (Công khai)
    @GetMapping("/{id}")
    public ResponseEntity<PublicEventResponse> getEventDetail(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        UUID userId = (user != null) ? user.getId() : null;
        return ResponseEntity.ok(publicEventService.getEventDetail(id, userId));
    }

    // 3. Đăng ký tham gia sự kiện (Yêu cầu đăng nhập)
    @PostMapping("/{id}/register")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> registerEvent(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(publicEventService.registerEvent(id, user.getId()));
    }

    // 4. Hủy đăng ký tham gia sự kiện (Yêu cầu đăng nhập)
    @DeleteMapping("/{id}/register")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> cancelRegistration(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(publicEventService.cancelRegistration(id, user.getId()));
    }

    // 5. Xem danh sách sự kiện tôi đã đăng ký
    @GetMapping("/my-registrations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudentRegistrationResponse>> getMyRegistrations(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(publicEventService.getMyRegistrations(user.getId()));
    }

    // 6. Quét QR Điểm danh sự kiện
    @PostMapping("/{id}/check-in")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> checkInEvent(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(publicEventService.checkInEvent(id, user.getId()));
    }
}
