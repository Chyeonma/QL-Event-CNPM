package com.project.event.service;

import java.util.Map;
import java.util.UUID;

public interface NotificationService {
    void sendNotification(UUID userId, UUID eventId, String title, String message);
    int broadcastToEventRegistrants(UUID eventId, String title, String message);
    Map<String, Object> getUserNotifications(UUID userId);
    void markAsRead(UUID notificationId, UUID userId);
    void markAllAsRead(UUID userId);
}
