package com.project.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {
    private UUID id;
    private String title;
    private String description;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer capacity;
    private Integer trainingPoints;
    private String status;
    private LocalDateTime createdAt;
    
    // Các trường thống kê hỗ trợ UI
    private long totalRegistrations;
    private long checkedInCount;
    
    // Các dữ liệu liên kết
    private List<EventTargetDto> targets;
    private List<EventImageDto> images;
}
