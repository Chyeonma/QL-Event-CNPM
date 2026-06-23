package com.project.event.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRequest {
    private String title;
    private String description;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer capacity;
    private Integer trainingPoints;
    private String status; // DRAFT, PUBLISHED, CLOSED
    
    // Khi tạo/sửa sự kiện, Admin gửi kèm danh sách cấu hình
    private List<EventTargetDto> targets;
    private List<String> imageUrls;
}
