package com.project.event.service;

import com.project.event.dto.MessageResponse;
import com.project.event.dto.PublicEventResponse;
import com.project.event.dto.StudentRegistrationResponse;

import java.util.List;
import java.util.UUID;

public interface PublicEventService {
    List<PublicEventResponse> getPublishedEvents(String keyword, UUID currentUserId);
    PublicEventResponse getEventDetail(UUID eventId, UUID currentUserId);
    MessageResponse registerEvent(UUID eventId, UUID studentId);
    MessageResponse cancelRegistration(UUID eventId, UUID studentId);
    List<StudentRegistrationResponse> getMyRegistrations(UUID studentId);
    MessageResponse checkInEvent(UUID eventId, UUID studentId);
}
