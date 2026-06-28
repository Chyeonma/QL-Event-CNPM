package com.project.event.service;

import com.project.event.dto.MessageResponse;
import com.project.event.entity.Event;
import com.project.event.entity.Registration;
import com.project.event.entity.User;
import com.project.event.repository.EventManagerRepository;
import com.project.event.repository.EventRepository;
import com.project.event.repository.RegistrationRepository;
import com.project.event.repository.UserRepository;
import com.project.event.service.impl.PublicEventServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PublicEventServiceTest {

    @Mock
    private EventRepository eventRepository;
    @Mock
    private RegistrationRepository registrationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EventManagerRepository eventManagerRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PublicEventServiceImpl publicEventService;

    private UUID eventId;
    private UUID studentId;
    private Event publishedEvent;
    private User student;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();
        studentId = UUID.randomUUID();

        student = User.builder()
                .id(studentId)
                .studentCode("B21DCCN001")
                .fullName("Nguyen Van A")
                .email("student@ptit.edu.vn")
                .role("STUDENT")
                .isDeleted(false)
                .build();

        publishedEvent = Event.builder()
                .id(eventId)
                .title("Ngay hoi PTIT 2025")
                .location("Hoi truong A")
                .startTime(LocalDateTime.now().plusDays(7))
                .endTime(LocalDateTime.now().plusDays(7).plusHours(3))
                .capacity(100)
                .trainingPoints(5)
                .status("PUBLISHED")
                .build();
    }

    // ==================== REGISTER EVENT ====================

    @Test
    @DisplayName("registerEvent - success registers new student")
    void registerEvent_success_newRegistration() {
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(publishedEvent));
        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(registrationRepository.countByEventIdAndStatus(eventId, "REGISTERED")).thenReturn(50L);
        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.empty());
        when(registrationRepository.save(any(Registration.class))).thenAnswer(inv -> inv.getArgument(0));

        MessageResponse response = publicEventService.registerEvent(eventId, studentId);

        assertEquals("Đăng ký tham gia sự kiện thành công", response.getMessage());
        verify(registrationRepository).save(any(Registration.class));
        verify(notificationService).sendNotification(eq(studentId), eq(eventId), anyString(), anyString());
    }

    @Test
    @DisplayName("registerEvent - restores cancelled registration")
    void registerEvent_restoresCancelledRegistration() {
        Registration cancelled = Registration.builder()
                .id(UUID.randomUUID())
                .event(publishedEvent)
                .student(student)
                .status("CANCELLED")
                .build();

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(publishedEvent));
        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(registrationRepository.countByEventIdAndStatus(eventId, "REGISTERED")).thenReturn(50L);
        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.of(cancelled));
        when(registrationRepository.save(any(Registration.class))).thenReturn(cancelled);

        MessageResponse response = publicEventService.registerEvent(eventId, studentId);

        assertEquals("Đăng ký tham gia sự kiện thành công", response.getMessage());
        assertEquals("REGISTERED", cancelled.getStatus());
        assertNull(cancelled.getCheckedInAt());
        verify(notificationService).sendNotification(eq(studentId), eq(eventId), anyString(), anyString());
    }

    @Test
    @DisplayName("registerEvent - event not found throws RuntimeException")
    void registerEvent_eventNotFound_throws() {
        when(eventRepository.findById(eventId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> publicEventService.registerEvent(eventId, studentId));
    }

    @Test
    @DisplayName("registerEvent - closed event throws RuntimeException")
    void registerEvent_closedEvent_throws() {
        publishedEvent.setStatus("CLOSED");
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(publishedEvent));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> publicEventService.registerEvent(eventId, studentId));
        assertTrue(ex.getMessage().contains("kết thúc"));
    }

    @Test
    @DisplayName("registerEvent - draft event throws RuntimeException")
    void registerEvent_draftEvent_throws() {
        publishedEvent.setStatus("DRAFT");
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(publishedEvent));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> publicEventService.registerEvent(eventId, studentId));
        assertTrue(ex.getMessage().contains("chưa mở đăng ký"));
    }

    @Test
    @DisplayName("registerEvent - full capacity throws RuntimeException")
    void registerEvent_fullCapacity_throws() {
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(publishedEvent));
        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(registrationRepository.countByEventIdAndStatus(eventId, "REGISTERED")).thenReturn(100L);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> publicEventService.registerEvent(eventId, studentId));
        assertTrue(ex.getMessage().contains("hết chỗ"));
    }

    @Test
    @DisplayName("registerEvent - already registered throws RuntimeException")
    void registerEvent_alreadyRegistered_throws() {
        Registration existing = Registration.builder()
                .id(UUID.randomUUID())
                .event(publishedEvent)
                .student(student)
                .status("REGISTERED")
                .build();

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(publishedEvent));
        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(registrationRepository.countByEventIdAndStatus(eventId, "REGISTERED")).thenReturn(50L);
        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.of(existing));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> publicEventService.registerEvent(eventId, studentId));
        assertTrue(ex.getMessage().contains("đã đăng ký"));
    }

    // ==================== CANCEL REGISTRATION ====================

    @Test
    @DisplayName("cancelRegistration - success cancels active registration")
    void cancelRegistration_success() {
        Registration reg = Registration.builder()
                .id(UUID.randomUUID())
                .event(publishedEvent)
                .student(student)
                .status("REGISTERED")
                .build();

        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.of(reg));
        when(registrationRepository.save(any(Registration.class))).thenReturn(reg);

        MessageResponse response = publicEventService.cancelRegistration(eventId, studentId);

        assertEquals("Hủy đăng ký sự kiện thành công", response.getMessage());
        assertEquals("CANCELLED", reg.getStatus());
        verify(notificationService).sendNotification(eq(studentId), eq(eventId), anyString(), anyString());
    }

    @Test
    @DisplayName("cancelRegistration - not registered throws RuntimeException")
    void cancelRegistration_notRegistered_throws() {
        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> publicEventService.cancelRegistration(eventId, studentId));
    }

    @Test
    @DisplayName("cancelRegistration - closed event throws RuntimeException")
    void cancelRegistration_closedEvent_throws() {
        publishedEvent.setStatus("CLOSED");
        Registration reg = Registration.builder()
                .id(UUID.randomUUID())
                .event(publishedEvent)
                .student(student)
                .status("REGISTERED")
                .build();

        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.of(reg));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> publicEventService.cancelRegistration(eventId, studentId));
        assertTrue(ex.getMessage().contains("khép lại"));
    }

    @Test
    @DisplayName("cancelRegistration - already checked in throws RuntimeException")
    void cancelRegistration_alreadyCheckedIn_throws() {
        Registration reg = Registration.builder()
                .id(UUID.randomUUID())
                .event(publishedEvent)
                .student(student)
                .status("REGISTERED")
                .checkedInAt(LocalDateTime.now())
                .build();

        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.of(reg));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> publicEventService.cancelRegistration(eventId, studentId));
        assertTrue(ex.getMessage().contains("điểm danh"));
    }

    @Test
    @DisplayName("cancelRegistration - already cancelled throws RuntimeException")
    void cancelRegistration_alreadyCancelled_throws() {
        Registration reg = Registration.builder()
                .id(UUID.randomUUID())
                .event(publishedEvent)
                .student(student)
                .status("CANCELLED")
                .build();

        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.of(reg));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> publicEventService.cancelRegistration(eventId, studentId));
        assertTrue(ex.getMessage().contains("hủy đăng ký"));
    }

    // ==================== CHECK IN ====================

    @Test
    @DisplayName("checkInEvent - success sets checkedInAt timestamp")
    void checkInEvent_success() {
        Registration reg = Registration.builder()
                .id(UUID.randomUUID())
                .event(publishedEvent)
                .student(student)
                .status("REGISTERED")
                .checkedInAt(null)
                .build();

        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.of(reg));
        when(registrationRepository.save(any(Registration.class))).thenReturn(reg);

        MessageResponse response = publicEventService.checkInEvent(eventId, studentId);

        assertEquals("Điểm danh sự kiện thành công", response.getMessage());
        assertNotNull(reg.getCheckedInAt());
        verify(notificationService).sendNotification(eq(studentId), eq(eventId), anyString(), anyString());
    }

    @Test
    @DisplayName("checkInEvent - student not registered throws RuntimeException")
    void checkInEvent_notRegistered_throws() {
        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> publicEventService.checkInEvent(eventId, studentId));
    }

    @Test
    @DisplayName("checkInEvent - cancelled registration throws RuntimeException")
    void checkInEvent_cancelledRegistration_throws() {
        Registration reg = Registration.builder()
                .id(UUID.randomUUID())
                .event(publishedEvent)
                .student(student)
                .status("CANCELLED")
                .build();

        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.of(reg));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> publicEventService.checkInEvent(eventId, studentId));
        assertTrue(ex.getMessage().contains("hủy"));
    }

    @Test
    @DisplayName("checkInEvent - already checked in throws RuntimeException")
    void checkInEvent_alreadyCheckedIn_throws() {
        Registration reg = Registration.builder()
                .id(UUID.randomUUID())
                .event(publishedEvent)
                .student(student)
                .status("REGISTERED")
                .checkedInAt(LocalDateTime.now().minusHours(1))
                .build();

        when(registrationRepository.findByEventIdAndStudentId(eventId, studentId)).thenReturn(Optional.of(reg));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> publicEventService.checkInEvent(eventId, studentId));
        assertTrue(ex.getMessage().contains("điểm danh rồi"));
    }

    // ==================== GET EVENT DETAIL ====================

    @Test
    @DisplayName("getEventDetail - published event returns response")
    void getEventDetail_published_returnsResponse() {
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(publishedEvent));
        when(registrationRepository.countByEventIdAndStatus(eventId, "REGISTERED")).thenReturn(50L);
        when(registrationRepository.findByEventIdAndStudentId(any(), any())).thenReturn(Optional.empty());
        when(userRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(eventManagerRepository.existsByEventIdAndUserId(any(), any())).thenReturn(false);

        assertDoesNotThrow(() -> publicEventService.getEventDetail(eventId, studentId));
    }

    @Test
    @DisplayName("getEventDetail - draft event throws RuntimeException")
    void getEventDetail_draftEvent_throws() {
        publishedEvent.setStatus("DRAFT");
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(publishedEvent));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> publicEventService.getEventDetail(eventId, studentId));
        assertTrue(ex.getMessage().contains("chưa được công bố"));
    }
}
