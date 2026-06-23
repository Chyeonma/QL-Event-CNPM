package com.project.event.controller;

import com.project.event.dto.AdminUserResponse;
import com.project.event.dto.AdminUserRequest;
import com.project.event.dto.AdminUserResponse;
import com.project.event.entity.User;
import com.project.event.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;

    private AdminUserResponse mapToResponse(User u) {
        return AdminUserResponse.builder()
                .id(u.getId())
                .studentCode(u.getStudentCode())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .classCode(u.getClassCode())
                .role(u.getRole())
                .requirePasswordChange(u.getRequirePasswordChange())
                .isDeleted(u.getIsDeleted())
                .hasPassword(u.getPasswordHash() != null && !u.getPasswordHash().isEmpty())
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<AdminUserResponse>> getUsersByRole(@RequestParam String role) {
        List<User> users = userRepository.findByRole(role.toUpperCase());
        List<AdminUserResponse> responses = users.stream().map(this::mapToResponse).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return ResponseEntity.ok(mapToResponse(user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserResponse> createUser(@RequestBody AdminUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại trong hệ thống");
        }
        User user = User.builder()
                .studentCode(request.getStudentCode())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .classCode(request.getClassCode())
                .role(request.getRole() != null ? request.getRole().toUpperCase() : "STUDENT")
                .requirePasswordChange(true)
                .isDeleted(false)
                // TUYỆT ĐỐI KHÔNG GÁN MẬT KHẨU THEO LUỒNG AUTH
                .build();
        return ResponseEntity.ok(mapToResponse(userRepository.save(user)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserResponse> updateUser(@PathVariable UUID id, @RequestBody AdminUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        user.setStudentCode(request.getStudentCode());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setClassCode(request.getClassCode());
        user.setRole(request.getRole() != null ? request.getRole().toUpperCase() : user.getRole());
        
        return ResponseEntity.ok(mapToResponse(userRepository.save(user)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> lockUser(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        user.setIsDeleted(true); // Khóa tài khoản
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unlockUser(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        user.setIsDeleted(false); // Mở khóa tài khoản
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }
}
