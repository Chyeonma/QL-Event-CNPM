package com.project.event.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AdminUserResponse {
    private UUID id;
    private String studentCode;
    private String fullName;
    private String email;
    private String classCode;
    private String role;
    private Boolean requirePasswordChange;
    private Boolean isDeleted;
    private Boolean hasPassword;
}
