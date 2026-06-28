package com.project.event.service;

import com.project.event.dto.AdminRegistrationResponse;
import com.project.event.dto.MessageResponse;

import java.util.List;
import java.util.UUID;

public interface AdminRegistrationService {
    List<AdminRegistrationResponse> getEventRegistrations(UUID eventId);
    List<AdminRegistrationResponse> getAllRegistrations();
    MessageResponse manualCheckIn(UUID registrationId);
    MessageResponse cancelCheckIn(UUID registrationId);
    MessageResponse cancelStudentRegistration(UUID registrationId);
}
