package com.project.event.controller;

import com.project.event.dto.AdminRegistrationResponse;
import com.project.event.dto.MessageResponse;
import com.project.event.service.AdminRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
public class AdminRegistrationController {

    private final AdminRegistrationService adminRegistrationService;

    // 1. Lấy danh sách đăng ký tham gia của 1 sự kiện
    @GetMapping("/{eventId}/registrations")
    public ResponseEntity<List<AdminRegistrationResponse>> getEventRegistrations(@PathVariable UUID eventId) {
        return ResponseEntity.ok(adminRegistrationService.getEventRegistrations(eventId));
    }

    // 1.1 Lấy tất cả danh sách đăng ký trong toàn hệ thống
    @GetMapping("/registrations/all")
    public ResponseEntity<List<AdminRegistrationResponse>> getAllRegistrations() {
        return ResponseEntity.ok(adminRegistrationService.getAllRegistrations());
    }

    // 2. Điểm danh thủ công cho sinh viên
    @PostMapping("/registrations/{registrationId}/check-in")
    public ResponseEntity<MessageResponse> manualCheckIn(@PathVariable UUID registrationId) {
        return ResponseEntity.ok(adminRegistrationService.manualCheckIn(registrationId));
    }

    // 3. Hủy suất đăng ký của sinh viên
    @DeleteMapping("/registrations/{registrationId}")
    public ResponseEntity<MessageResponse> cancelRegistration(@PathVariable UUID registrationId) {
        return ResponseEntity.ok(adminRegistrationService.cancelStudentRegistration(registrationId));
    }
}
