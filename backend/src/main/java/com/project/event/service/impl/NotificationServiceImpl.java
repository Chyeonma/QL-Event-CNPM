package com.project.event.service.impl;

import com.project.event.dto.NotificationResponse;
import com.project.event.entity.Event;
import com.project.event.entity.Notification;
import com.project.event.entity.Registration;
import com.project.event.entity.User;
import com.project.event.repository.EventRepository;
import com.project.event.repository.NotificationRepository;
import com.project.event.repository.RegistrationRepository;
import com.project.event.repository.UserRepository;
import com.project.event.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;

    @Override
    @Transactional
    public void sendNotification(UUID userId, UUID eventId, String title, String message) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Event event = null;
        if (eventId != null) {
            event = eventRepository.findById(eventId).orElse(null);
        }

        Notification notification = Notification.builder()
                .user(user)
                .event(event)
                .title(title)
                .message(message)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public int broadcastToEventRegistrants(UUID eventId, String title, String message) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Sự kiện không tồn tại"));

        List<Registration> registrations = registrationRepository.findByEventIdOrderByRegisteredAtDesc(eventId);
        List<Notification> notifications = new ArrayList<>();

        for (Registration reg : registrations) {
            if ("REGISTERED".equals(reg.getStatus()) && reg.getStudent() != null) {
                Notification notif = Notification.builder()
                        .user(reg.getStudent())
                        .event(event)
                        .title(title)
                        .message(message)
                        .isRead(false)
                        .build();
                notifications.add(notif);
            }
        }

        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }

        return notifications.size();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getUserNotifications(UUID userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(userId);

        List<NotificationResponse> responses = list.stream().map(n -> NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .eventId(n.getEvent() != null ? n.getEvent().getId() : null)
                .eventTitle(n.getEvent() != null ? n.getEvent().getTitle() : null)
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build()
        ).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("notifications", responses);
        result.put("unreadCount", unreadCount);
        return result;
    }

    @Override
    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        Optional<Notification> opt = notificationRepository.findById(notificationId);
        if (opt.isPresent()) {
            Notification n = opt.get();
            if (n.getUser().getId().equals(userId)) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }
}
