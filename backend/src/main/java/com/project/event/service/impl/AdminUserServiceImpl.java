package com.project.event.service.impl;

import com.project.event.dto.AdminUserRequest;
import com.project.event.dto.AdminUserResponse;
import com.project.event.entity.User;
import com.project.event.repository.UserRepository;
import com.project.event.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

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

    @Override
    public List<AdminUserResponse> getUsersByRole(String role) {
        List<User> users = userRepository.findByRole(role.toUpperCase());
        return users.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public AdminUserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return mapToResponse(user);
    }

    @Override
    public AdminUserResponse createUser(AdminUserRequest request) {
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
                .build();
        return mapToResponse(userRepository.save(user));
    }

    @Override
    public AdminUserResponse updateUser(UUID id, AdminUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        user.setStudentCode(request.getStudentCode());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setClassCode(request.getClassCode());
        user.setRole(request.getRole() != null ? request.getRole().toUpperCase() : user.getRole());
        
        return mapToResponse(userRepository.save(user));
    }

    @Override
    public void lockUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        user.setIsDeleted(true);
        userRepository.save(user);
    }

    @Override
    public void unlockUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        user.setIsDeleted(false);
        userRepository.save(user);
    }
}
