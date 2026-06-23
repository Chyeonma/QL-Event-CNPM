package com.project.event.dto;

import lombok.Data;

@Data
public class AdminUserRequest {
    private String studentCode;
    private String fullName;
    private String email;
    private String classCode;
    private String role;
}
