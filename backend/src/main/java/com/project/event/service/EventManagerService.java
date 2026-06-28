package com.project.event.service;

import com.project.event.dto.AddEventManagerRequest;
import com.project.event.dto.AdminRegistrationResponse;
import com.project.event.dto.EventManagerResponse;
import com.project.event.dto.MessageResponse;

import java.util.List;
import java.util.UUID;

public interface EventManagerService {
    List<EventManagerResponse> getEventManagers(UUID eventId);
    EventManagerResponse addEventManager(UUID eventId, AddEventManagerRequest request, UUID currentUserId);
    void removeEventManager(UUID eventId, UUID userIdToRemove, UUID currentUserId);
    
    // Các thao tác quản lý/điểm danh sự kiện dành cho Manager của sự kiện đó
    List<AdminRegistrationResponse> getEventRegistrationsForManager(UUID eventId, UUID currentUserId);
    MessageResponse manualCheckInForManager(UUID registrationId, UUID currentUserId);
    MessageResponse cancelCheckInForManager(UUID registrationId, UUID currentUserId);
}
