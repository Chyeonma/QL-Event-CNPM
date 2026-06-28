package com.project.event.controller;

import com.project.event.dto.*;
import com.project.event.entity.User;
import com.project.event.service.EventManagerService;
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
    private final EventManagerService eventManagerService;

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

    // 6. Quét QR Điểm danh sự kiện (Dành cho sinh viên tự check-in nếu có QR)
    @PostMapping("/{id}/check-in")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> checkInEvent(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(publicEventService.checkInEvent(id, user.getId()));
    }

    // --- CÁC ENDPOINT DÀNH CHO BAN TỔ CHỨC / QUẢN LÝ SỰ KIỆN ---

    @GetMapping("/{id}/managers")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EventManagerResponse>> getEventManagers(@PathVariable UUID id) {
        return ResponseEntity.ok(eventManagerService.getEventManagers(id));
    }

    @PostMapping("/{id}/managers")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EventManagerResponse> addEventManager(
            @PathVariable UUID id,
            @RequestBody AddEventManagerRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(eventManagerService.addEventManager(id, request, user.getId()));
    }

    @DeleteMapping("/{id}/managers/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> removeEventManager(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @AuthenticationPrincipal User user) {
        eventManagerService.removeEventManager(id, userId, user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/registrations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AdminRegistrationResponse>> getEventRegistrationsForManager(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(eventManagerService.getEventRegistrationsForManager(id, user.getId()));
    }

    @PostMapping("/registrations/{registrationId}/manual-check-in")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> manualCheckInForManager(
            @PathVariable UUID registrationId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(eventManagerService.manualCheckInForManager(registrationId, user.getId()));
    }

    @PostMapping("/registrations/{registrationId}/cancel-check-in")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> cancelCheckInForManager(
            @PathVariable UUID registrationId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(eventManagerService.cancelCheckInForManager(registrationId, user.getId()));
    }

    @PostMapping("/{id}/notifications")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> sendNotificationForManager(
            @PathVariable UUID id,
            @RequestBody @jakarta.validation.Valid SendNotificationRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(eventManagerService.sendNotificationForManager(id, request, user.getId()));
    }
}
