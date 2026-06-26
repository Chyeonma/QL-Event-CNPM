package com.project.event.service.impl;

import com.project.event.dto.EventImageDto;
import com.project.event.dto.EventRequest;
import com.project.event.dto.EventResponse;
import com.project.event.dto.EventTargetDto;
import com.project.event.entity.Event;
import com.project.event.entity.EventImage;
import com.project.event.entity.EventTarget;
import com.project.event.entity.User;
import com.project.event.repository.EventRepository;
import com.project.event.repository.RegistrationRepository;
import com.project.event.repository.UserRepository;
import com.project.event.service.AdminEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminEventServiceImpl implements AdminEventService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public EventResponse createEvent(EventRequest request, UUID creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .capacity(request.getCapacity())
                .trainingPoints(request.getTrainingPoints() != null ? request.getTrainingPoints() : 0)
                .status(request.getStatus())
                .createdBy(creator)
                .build();

        // Map Targets
        if (request.getTargets() != null) {
            request.getTargets().forEach(t -> {
                EventTarget target = EventTarget.builder()
                        .batch(t.getBatch())
                        .major(t.getMajor())
                        .build();
                event.addTarget(target);
            });
        }

        // Map Images
        if (request.getImageUrls() != null) {
            int order = 0;
            for (String url : request.getImageUrls()) {
                EventImage img = EventImage.builder()
                        .imageUrl(url)
                        .displayOrder(order++)
                        .build();
                event.addImage(img);
            }
        }

        Event savedEvent = eventRepository.save(event);
        return mapToResponse(savedEvent);
    }

    @Override
    @Transactional
    public EventResponse updateEvent(UUID eventId, EventRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Sự kiện không tồn tại"));

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setCapacity(request.getCapacity());
        event.setTrainingPoints(request.getTrainingPoints() != null ? request.getTrainingPoints() : 0);
        event.setStatus(request.getStatus());

        // Update Targets: Clear cũ, thêm mới (JPA tự động xoá theo orphanRemoval)
        event.getTargets().clear();
        if (request.getTargets() != null) {
            request.getTargets().forEach(t -> {
                EventTarget target = EventTarget.builder()
                        .batch(t.getBatch())
                        .major(t.getMajor())
                        .build();
                event.addTarget(target);
            });
        }

        // Update Images: Clear cũ, thêm mới
        event.getImages().clear();
        if (request.getImageUrls() != null) {
            int order = 0;
            for (String url : request.getImageUrls()) {
                EventImage img = EventImage.builder()
                        .imageUrl(url)
                        .displayOrder(order++)
                        .build();
                event.addImage(img);
            }
        }

        Event updatedEvent = eventRepository.save(event);
        return mapToResponse(updatedEvent);
    }

    @Override
    @Transactional
    public void deleteEvent(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Sự kiện không tồn tại"));
        eventRepository.delete(event);
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse getEventById(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Sự kiện không tồn tại"));
        return mapToResponse(event);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAllByOrderByStartTimeDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getEventsByStatus(String status) {
        return eventRepository.findByStatusOrderByStartTimeDesc(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> searchEvents(String keyword) {
        return eventRepository.searchEvents(keyword)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // --- Hàm Helper để map Entity sang DTO ---
    private EventResponse mapToResponse(Event event) {
        long totalRegistrations = registrationRepository.countByEventIdAndStatus(event.getId(), "REGISTERED");
        long checkedInCount = registrationRepository.countByEventIdAndCheckedInAtIsNotNull(event.getId());

        List<EventTargetDto> targetDtos = event.getTargets().stream()
                .map(t -> new EventTargetDto(t.getBatch(), t.getMajor()))
                .collect(Collectors.toList());

        List<EventImageDto> imageDtos = event.getImages().stream()
                .map(img -> new EventImageDto(img.getId(), img.getImageUrl(), img.getDisplayOrder()))
                .collect(Collectors.toList());

        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .capacity(event.getCapacity())
                .trainingPoints(event.getTrainingPoints())
                .status(event.getStatus())
                .createdAt(event.getCreatedAt())
                .totalRegistrations(totalRegistrations)
                .checkedInCount(checkedInCount)
                .targets(targetDtos)
                .images(imageDtos)
                .build();
    }
}
