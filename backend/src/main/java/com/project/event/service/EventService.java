package com.project.event.service;

import com.project.event.dto.EventRequest;
import com.project.event.dto.EventResponse;

import java.util.List;
import java.util.UUID;

public interface EventService {
    // 1. Quản lý chung
    EventResponse createEvent(EventRequest request, UUID creatorId);
    EventResponse updateEvent(UUID eventId, EventRequest request);
    void deleteEvent(UUID eventId);
    
    // 2. Lấy dữ liệu
    EventResponse getEventById(UUID eventId);
    List<EventResponse> getAllEvents();
    List<EventResponse> getEventsByStatus(String status);
    List<EventResponse> searchEvents(String keyword);
}
