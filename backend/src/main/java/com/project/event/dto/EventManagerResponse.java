package com.project.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventManagerResponse {
    private UUID id;          // ID của record event_managers
    private UUID userId;      // ID của user
    private String studentCode;
    private String fullName;
    private String email;
    private String role;
    private LocalDateTime assignedAt;
}
