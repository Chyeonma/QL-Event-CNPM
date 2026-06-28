package com.project.event.service;

import com.project.event.dto.EventRequest;
import com.project.event.dto.EventResponse;
import com.project.event.entity.Event;
import com.project.event.entity.User;
import com.project.event.repository.EventManagerRepository;
import com.project.event.repository.EventRepository;
import com.project.event.repository.RegistrationRepository;
import com.project.event.repository.UserRepository;
import com.project.event.service.impl.AdminEventServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminEventServiceTest {

    @Mock
    private EventRepository eventRepository;
    @Mock
    private RegistrationRepository registrationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EventManagerRepository eventManagerRepository;

    @InjectMocks
    private AdminEventServiceImpl adminEventService;

    private UUID eventId;
    private UUID creatorId;
    private User creator;
    private Event event;
    private EventRequest validRequest;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();
        creatorId = UUID.randomUUID();

        creator = User.builder()
                .id(creatorId)
                .fullName("Admin User")
                .email("admin@ptit.edu.vn")
                .role("ADMIN")
                .build();

        event = Event.builder()
                .id(eventId)
                .title("Ngay hoi PTIT 2025")
                .description("Mo ta su kien")
                .location("Hoi truong A")
                .startTime(LocalDateTime.now().plusDays(7))
                .endTime(LocalDateTime.now().plusDays(7).plusHours(3))
                .capacity(100)
                .trainingPoints(5)
                .status("DRAFT")
                .createdBy(creator)
                .build();

        validRequest = new EventRequest();
        validRequest.setTitle("Ngay hoi PTIT 2025");
        validRequest.setDescription("Mo ta su kien");
        validRequest.setLocation("Hoi truong A");
        validRequest.setStartTime(LocalDateTime.now().plusDays(7));
        validRequest.setEndTime(LocalDateTime.now().plusDays(7).plusHours(3));
        validRequest.setCapacity(100);
        validRequest.setTrainingPoints(5);
        validRequest.setStatus("DRAFT");
    }

    // ==================== CREATE EVENT ====================

    @Test
    @DisplayName("createEvent - success creates event with creator")
    void createEvent_success() {
        when(userRepository.findById(creatorId)).thenReturn(Optional.of(creator));
        when(eventRepository.save(any(Event.class))).thenAnswer(inv -> {
            Event e = inv.getArgument(0);
            e.setId(UUID.randomUUID());
            return e;
        });
        when(registrationRepository.countByEventIdAndStatus(any(), eq("REGISTERED"))).thenReturn(0L);
        when(registrationRepository.countByEventIdAndCheckedInAtIsNotNull(any())).thenReturn(0L);
        when(eventManagerRepository.findByEventId(any())).thenReturn(Collections.emptyList());

        EventResponse response = adminEventService.createEvent(validRequest, creatorId);

        assertNotNull(response);
        assertEquals("Ngay hoi PTIT 2025", response.getTitle());
        assertEquals("DRAFT", response.getStatus());
        assertEquals(5, response.getTrainingPoints());
        verify(eventRepository).save(any(Event.class));
    }

    @Test
    @DisplayName("createEvent - creator not found throws RuntimeException")
    void createEvent_creatorNotFound_throws() {
        UUID unknownId = UUID.randomUUID();
        when(userRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> adminEventService.createEvent(validRequest, unknownId));
        verify(eventRepository, never()).save(any());
    }

    @Test
    @DisplayName("createEvent - null trainingPoints defaults to 0")
    void createEvent_nullTrainingPoints_defaultsToZero() {
        validRequest.setTrainingPoints(null);

        when(userRepository.findById(creatorId)).thenReturn(Optional.of(creator));
        when(eventRepository.save(any(Event.class))).thenAnswer(inv -> {
            Event e = inv.getArgument(0);
            e.setId(UUID.randomUUID());
            return e;
        });
        when(registrationRepository.countByEventIdAndStatus(any(), anyString())).thenReturn(0L);
        when(registrationRepository.countByEventIdAndCheckedInAtIsNotNull(any())).thenReturn(0L);
        when(eventManagerRepository.findByEventId(any())).thenReturn(Collections.emptyList());

        EventResponse response = adminEventService.createEvent(validRequest, creatorId);

        assertEquals(0, response.getTrainingPoints());
    }

    // ==================== UPDATE EVENT ====================

    @Test
    @DisplayName("updateEvent - success updates event fields")
    void updateEvent_success() {
        EventRequest updateReq = new EventRequest();
        updateReq.setTitle("Tên Mới");
        updateReq.setDescription("Mô tả mới");
        updateReq.setLocation("Phòng B2");
        updateReq.setStartTime(LocalDateTime.now().plusDays(10));
        updateReq.setEndTime(LocalDateTime.now().plusDays(10).plusHours(2));
        updateReq.setCapacity(200);
        updateReq.setTrainingPoints(10);
        updateReq.setStatus("PUBLISHED");

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenReturn(event);
        when(registrationRepository.countByEventIdAndStatus(eq(eventId), anyString())).thenReturn(0L);
        when(registrationRepository.countByEventIdAndCheckedInAtIsNotNull(eventId)).thenReturn(0L);
        when(eventManagerRepository.findByEventId(eventId)).thenReturn(Collections.emptyList());

        adminEventService.updateEvent(eventId, updateReq);

        assertEquals("Tên Mới", event.getTitle());
        assertEquals("PUBLISHED", event.getStatus());
        assertEquals(200, event.getCapacity());
    }

    @Test
    @DisplayName("updateEvent - event not found throws RuntimeException")
    void updateEvent_notFound_throws() {
        UUID unknownId = UUID.randomUUID();
        when(eventRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> adminEventService.updateEvent(unknownId, validRequest));
    }

    // ==================== DELETE EVENT ====================

    @Test
    @DisplayName("deleteEvent - calls repository delete")
    void deleteEvent_success() {
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        doNothing().when(eventRepository).delete(event);

        adminEventService.deleteEvent(eventId);

        verify(eventRepository).delete(event);
    }

    @Test
    @DisplayName("deleteEvent - event not found throws RuntimeException")
    void deleteEvent_notFound_throws() {
        UUID unknownId = UUID.randomUUID();
        when(eventRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> adminEventService.deleteEvent(unknownId));
        verify(eventRepository, never()).delete(any());
    }

    // ==================== GET EVENT BY ID ====================

    @Test
    @DisplayName("getEventById - found returns response")
    void getEventById_found_returnsResponse() {
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(registrationRepository.countByEventIdAndStatus(eventId, "REGISTERED")).thenReturn(30L);
        when(registrationRepository.countByEventIdAndCheckedInAtIsNotNull(eventId)).thenReturn(10L);
        when(eventManagerRepository.findByEventId(eventId)).thenReturn(Collections.emptyList());

        EventResponse response = adminEventService.getEventById(eventId);

        assertNotNull(response);
        assertEquals(eventId, response.getId());
        assertEquals(30L, response.getTotalRegistrations());
        assertEquals(10L, response.getCheckedInCount());
    }

    @Test
    @DisplayName("getEventById - not found throws RuntimeException")
    void getEventById_notFound_throws() {
        UUID unknownId = UUID.randomUUID();
        when(eventRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> adminEventService.getEventById(unknownId));
    }

    // ==================== GET ALL EVENTS ====================

    @Test
    @DisplayName("getAllEvents - returns mapped list ordered by startTime")
    void getAllEvents_returnsAll() {
        when(eventRepository.findAllByOrderByStartTimeDesc()).thenReturn(List.of(event));
        when(registrationRepository.countByEventIdAndStatus(eventId, "REGISTERED")).thenReturn(0L);
        when(registrationRepository.countByEventIdAndCheckedInAtIsNotNull(eventId)).thenReturn(0L);
        when(eventManagerRepository.findByEventId(eventId)).thenReturn(Collections.emptyList());

        List<EventResponse> result = adminEventService.getAllEvents();

        assertEquals(1, result.size());
        assertEquals("Ngay hoi PTIT 2025", result.get(0).getTitle());
    }

    @Test
    @DisplayName("getAllEvents - empty repository returns empty list")
    void getAllEvents_emptyRepo_returnsEmptyList() {
        when(eventRepository.findAllByOrderByStartTimeDesc()).thenReturn(Collections.emptyList());

        List<EventResponse> result = adminEventService.getAllEvents();

        assertTrue(result.isEmpty());
    }

    // ==================== GET EVENTS BY STATUS ====================

    @Test
    @DisplayName("getEventsByStatus - filters by PUBLISHED status")
    void getEventsByStatus_published_returnsFiltered() {
        event.setStatus("PUBLISHED");
        when(eventRepository.findByStatusOrderByStartTimeDesc("PUBLISHED")).thenReturn(List.of(event));
        when(registrationRepository.countByEventIdAndStatus(eventId, "REGISTERED")).thenReturn(0L);
        when(registrationRepository.countByEventIdAndCheckedInAtIsNotNull(eventId)).thenReturn(0L);
        when(eventManagerRepository.findByEventId(eventId)).thenReturn(Collections.emptyList());

        List<EventResponse> result = adminEventService.getEventsByStatus("PUBLISHED");

        assertEquals(1, result.size());
        assertEquals("PUBLISHED", result.get(0).getStatus());
    }
}
