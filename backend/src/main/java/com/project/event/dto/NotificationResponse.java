package com.project.event.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class NotificationResponse {
    private UUID id;
    private String title;
    private String message;
    private UUID eventId;
    private String eventTitle;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
