package com.project.event.service;

import com.project.event.entity.Event;
import com.project.event.entity.Notification;
import com.project.event.entity.Registration;
import com.project.event.entity.User;
import com.project.event.repository.EventRepository;
import com.project.event.repository.NotificationRepository;
import com.project.event.repository.RegistrationRepository;
import com.project.event.repository.UserRepository;
import com.project.event.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EventRepository eventRepository;
    @Mock
    private RegistrationRepository registrationRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private UUID userId;
    private UUID eventId;
    private User student;
    private User admin;
    private Event event;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        eventId = UUID.randomUUID();

        student = User.builder()
                .id(userId)
                .fullName("Nguyen Van A")
                .email("student@ptit.edu.vn")
                .role("STUDENT")
                .build();

        admin = User.builder()
                .id(UUID.randomUUID())
                .fullName("Admin")
                .email("admin@ptit.edu.vn")
                .role("ADMIN")
                .build();

        event = Event.builder()
                .id(eventId)
                .title("Ngay hoi PTIT 2025")
                .status("PUBLISHED")
                .build();
    }

    // ==================== SEND NOTIFICATION ====================

    @Test
    @DisplayName("sendNotification - saves notification for existing user")
    void sendNotification_userExists_savesNotification() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(student));
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        notificationService.sendNotification(userId, eventId, "Tiêu đề", "Nội dung");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        Notification saved = captor.getValue();

        assertEquals("Tiêu đề", saved.getTitle());
        assertEquals("Nội dung", saved.getMessage());
        assertFalse(saved.getIsRead());
        assertEquals(student, saved.getUser());
        assertEquals(event, saved.getEvent());
    }

    @Test
    @DisplayName("sendNotification - silently skips if user not found")
    void sendNotification_userNotFound_doesNotSave() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        notificationService.sendNotification(userId, eventId, "Title", "Msg");

        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("sendNotification - handles null eventId gracefully")
    void sendNotification_nullEventId_savesWithoutEvent() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(student));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        notificationService.sendNotification(userId, null, "Title", "Msg");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        assertNull(captor.getValue().getEvent());
    }

    // ==================== BROADCAST ====================

    @Test
    @DisplayName("broadcastToEventRegistrants - sends only to REGISTERED students")
    void broadcastToEventRegistrants_sendsToRegisteredOnly() {
        User student2 = User.builder().id(UUID.randomUUID()).role("STUDENT").build();

        Registration reg1 = Registration.builder()
                .student(student).status("REGISTERED").event(event).build();
        Registration reg2 = Registration.builder()
                .student(student2).status("CANCELLED").event(event).build();

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdOrderByRegisteredAtDesc(eventId)).thenReturn(List.of(reg1, reg2));
        when(notificationRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        int count = notificationService.broadcastToEventRegistrants(eventId, "Nhắc nhở", "Sự kiện sắp diễn ra");

        assertEquals(1, count);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Notification>> captor = ArgumentCaptor.forClass((Class<List<Notification>>) (Class<?>) List.class);
        verify(notificationRepository).saveAll(captor.capture());
        assertEquals(1, captor.getValue().size());
        assertEquals(student, captor.getValue().get(0).getUser());
    }

    @Test
    @DisplayName("broadcastToEventRegistrants - no registrations sends 0 notifications")
    void broadcastToEventRegistrants_noRegistrations_returns0() {
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdOrderByRegisteredAtDesc(eventId)).thenReturn(Collections.emptyList());

        int count = notificationService.broadcastToEventRegistrants(eventId, "Title", "Msg");

        assertEquals(0, count);
        verify(notificationRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("broadcastToEventRegistrants - event not found throws RuntimeException")
    void broadcastToEventRegistrants_eventNotFound_throws() {
        when(eventRepository.findById(eventId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> notificationService.broadcastToEventRegistrants(eventId, "Title", "Msg"));
    }

    // ==================== GET USER NOTIFICATIONS ====================

    @Test
    @DisplayName("getUserNotifications - ADMIN sees all notifications")
    void getUserNotifications_admin_seesAll() {
        Notification n = Notification.builder()
                .id(UUID.randomUUID())
                .user(admin)
                .title("All")
                .message("Admin broadcast")
                .isRead(false)
                .build();

        when(notificationRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(n));
        when(notificationRepository.countByIsReadFalse()).thenReturn(1L);

        Map<String, Object> result = notificationService.getUserNotifications(admin);

        assertNotNull(result.get("notifications"));
        assertEquals(1L, result.get("unreadCount"));
    }

    @Test
    @DisplayName("getUserNotifications - STUDENT sees only own notifications")
    void getUserNotifications_student_seesOwnOnly() {
        Notification n = Notification.builder()
                .id(UUID.randomUUID())
                .user(student)
                .title("For student")
                .message("Your event reminder")
                .isRead(false)
                .build();

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(n));
        when(notificationRepository.countByUserIdAndIsReadFalse(userId)).thenReturn(1L);

        Map<String, Object> result = notificationService.getUserNotifications(student);

        assertEquals(1L, result.get("unreadCount"));
    }

    @Test
    @DisplayName("getUserNotifications - null user returns empty list")
    void getUserNotifications_nullUser_returnsEmpty() {
        Map<String, Object> result = notificationService.getUserNotifications(null);

        List<?> notifications = (List<?>) result.get("notifications");
        assertTrue(notifications.isEmpty());
        assertEquals(0L, result.get("unreadCount"));
    }

    // ==================== MARK AS READ ====================

    @Test
    @DisplayName("markAsRead - owner can mark own notification as read")
    void markAsRead_owner_marksRead() {
        Notification n = Notification.builder()
                .id(UUID.randomUUID())
                .user(student)
                .title("Title")
                .isRead(false)
                .build();

        when(notificationRepository.findById(n.getId())).thenReturn(Optional.of(n));
        when(notificationRepository.save(any(Notification.class))).thenReturn(n);

        notificationService.markAsRead(n.getId(), student);

        assertTrue(n.getIsRead());
        verify(notificationRepository).save(n);
    }

    @Test
    @DisplayName("markAsRead - admin can mark any notification as read")
    void markAsRead_admin_canMarkAnyNotification() {
        Notification n = Notification.builder()
                .id(UUID.randomUUID())
                .user(student)
                .title("Title")
                .isRead(false)
                .build();

        when(notificationRepository.findById(n.getId())).thenReturn(Optional.of(n));
        when(notificationRepository.save(any(Notification.class))).thenReturn(n);

        notificationService.markAsRead(n.getId(), admin);

        assertTrue(n.getIsRead());
    }

    @Test
    @DisplayName("markAsRead - different user cannot mark another's notification")
    void markAsRead_differentUser_doesNotMark() {
        User otherUser = User.builder().id(UUID.randomUUID()).role("STUDENT").build();
        Notification n = Notification.builder()
                .id(UUID.randomUUID())
                .user(student)
                .title("Title")
                .isRead(false)
                .build();

        when(notificationRepository.findById(n.getId())).thenReturn(Optional.of(n));

        notificationService.markAsRead(n.getId(), otherUser);

        assertFalse(n.getIsRead());
        verify(notificationRepository, never()).save(any());
    }

    // ==================== MARK ALL AS READ ====================

    @Test
    @DisplayName("markAllAsRead - admin marks all globally")
    void markAllAsRead_admin_marksAllGlobally() {
        notificationService.markAllAsRead(admin);

        verify(notificationRepository).markAllAsRead();
        verify(notificationRepository, never()).markAllAsReadByUserId(any());
    }

    @Test
    @DisplayName("markAllAsRead - student marks only own notifications")
    void markAllAsRead_student_marksOnlyOwn() {
        notificationService.markAllAsRead(student);

        verify(notificationRepository).markAllAsReadByUserId(userId);
        verify(notificationRepository, never()).markAllAsRead();
    }

    @Test
    @DisplayName("markAllAsRead - null user does nothing")
    void markAllAsRead_nullUser_doesNothing() {
        notificationService.markAllAsRead(null);

        verify(notificationRepository, never()).markAllAsRead();
        verify(notificationRepository, never()).markAllAsReadByUserId(any());
    }
}
