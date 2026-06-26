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
public class StudentRegistrationResponse {
    private UUID id; // registration id
    private UUID eventId;
    private String eventTitle;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer trainingPoints;
    private String status; // REGISTERED, CANCELLED
    private LocalDateTime registeredAt;
    private LocalDateTime checkedInAt;
    private String description;
    private String organizerName;
    private String eventStatus; // PUBLISHED, CLOSED
}
