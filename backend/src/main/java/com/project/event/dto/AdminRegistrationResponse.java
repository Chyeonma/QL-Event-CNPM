package com.project.event.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminRegistrationResponse {
    private UUID id;
    private UUID studentId;
    private String studentCode;
    private String fullName;
    private String classCode;
    private String email;
    private String status; // REGISTERED, CANCELLED
    private LocalDateTime registeredAt;
    private LocalDateTime checkedInAt;
}
