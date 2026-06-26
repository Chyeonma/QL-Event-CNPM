package com.project.event.service;

import com.project.event.dto.AdminUserRequest;
import com.project.event.dto.AdminUserResponse;

import java.util.List;
import java.util.UUID;

public interface AdminUserService {
    List<AdminUserResponse> getUsersByRole(String role);
    AdminUserResponse getUserById(UUID id);
    AdminUserResponse createUser(AdminUserRequest request);
    AdminUserResponse updateUser(UUID id, AdminUserRequest request);
    void lockUser(UUID id);
    void unlockUser(UUID id);
}
