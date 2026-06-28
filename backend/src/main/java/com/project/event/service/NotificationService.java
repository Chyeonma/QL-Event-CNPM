package com.project.event.service;

import com.project.event.entity.User;
import java.util.Map;
import java.util.UUID;

public interface NotificationService {
    void sendNotification(UUID userId, UUID eventId, String title, String message);
    int broadcastToEventRegistrants(UUID eventId, String title, String message);
    Map<String, Object> getUserNotifications(User user);
    void markAsRead(UUID notificationId, User user);
    void markAllAsRead(User user);
}
