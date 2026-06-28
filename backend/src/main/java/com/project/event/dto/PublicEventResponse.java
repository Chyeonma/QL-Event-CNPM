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
public class PublicEventResponse {
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
    
    // Thống kê & Trạng thái đăng ký của user hiện tại
    private long registeredCount;
    private Boolean isRegistered;
    private String userRegistrationStatus; // REGISTERED, CANCELLED, CHECKED_IN, NONE
    
    // Quyền hạn của user hiện tại trên sự kiện này
    private Boolean isManager;
    
    // Dữ liệu liên kết
    private List<EventTargetDto> targets;
    private List<EventImageDto> images;
}
