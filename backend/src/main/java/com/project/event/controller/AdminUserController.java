package com.project.event.controller;

import com.project.event.dto.AdminUserRequest;
import com.project.event.dto.AdminUserResponse;
import com.project.event.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<AdminUserResponse>> getUsersByRole(@RequestParam String role) {
        return ResponseEntity.ok(adminUserService.getUsersByRole(role));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(adminUserService.getUserById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserResponse> createUser(@RequestBody AdminUserRequest request) {
        return ResponseEntity.ok(adminUserService.createUser(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserResponse> updateUser(@PathVariable UUID id, @RequestBody AdminUserRequest request) {
        return ResponseEntity.ok(adminUserService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> lockUser(@PathVariable UUID id) {
        adminUserService.lockUser(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unlockUser(@PathVariable UUID id) {
        adminUserService.unlockUser(id);
        return ResponseEntity.ok().build();
    }
}
