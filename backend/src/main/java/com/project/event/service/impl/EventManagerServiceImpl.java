package com.project.event.service.impl;

import com.project.event.dto.AddEventManagerRequest;
import com.project.event.dto.AdminRegistrationResponse;
import com.project.event.dto.EventManagerResponse;
import com.project.event.dto.MessageResponse;
import com.project.event.entity.Event;
import com.project.event.entity.EventManager;
import com.project.event.entity.Registration;
import com.project.event.entity.User;
import com.project.event.repository.EventManagerRepository;
import com.project.event.repository.EventRepository;
import com.project.event.repository.RegistrationRepository;
import com.project.event.repository.UserRepository;
import com.project.event.service.AdminRegistrationService;
import com.project.event.service.EventManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventManagerServiceImpl implements EventManagerService {

    private final EventManagerRepository eventManagerRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;
    private final AdminRegistrationService adminRegistrationService;

    private boolean checkCanManage(Event event, User currentUser) {
        if (currentUser == null) return false;
        if ("ADMIN".equals(currentUser.getRole())) return true;
        if (event.getCreatedBy() != null && event.getCreatedBy().getId().equals(currentUser.getId())) return true;
        return eventManagerRepository.existsByEventIdAndUserId(event.getId(), currentUser.getId());
    }

    private EventManagerResponse mapToDto(EventManager em) {
        User u = em.getUser();
        return EventManagerResponse.builder()
                .id(em.getId())
                .userId(u != null ? u.getId() : null)
                .studentCode(u != null ? u.getStudentCode() : "N/A")
                .fullName(u != null ? u.getFullName() : "Unknown")
                .email(u != null ? u.getEmail() : "N/A")
                .role(u != null ? u.getRole() : "STUDENT")
                .assignedAt(em.getAssignedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventManagerResponse> getEventManagers(UUID eventId) {
        return eventManagerRepository.findByEventId(eventId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EventManagerResponse addEventManager(UUID eventId, AddEventManagerRequest request, UUID currentUserId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Sự kiện không tồn tại"));
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Người dùng không hợp lệ"));

        if (!checkCanManage(event, currentUser)) {
            throw new RuntimeException("Bạn không có quyền thêm quản lý cho sự kiện này");
        }

        String identifier = request.getIdentifier() != null ? request.getIdentifier().trim() : "";
        User targetUser = userRepository.findByIdentifier(identifier).orElse(null);

        if (targetUser == null) {
            throw new RuntimeException("Không tìm thấy tài khoản với Email hoặc Mã sinh viên: " + identifier);
        }

        if (eventManagerRepository.existsByEventIdAndUserId(eventId, targetUser.getId())) {
            throw new RuntimeException("Tài khoản này đã là quản lý của sự kiện");
        }

        EventManager em = EventManager.builder()
                .event(event)
                .user(targetUser)
                .assignedAt(LocalDateTime.now())
                .build();

        EventManager saved = eventManagerRepository.save(em);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void removeEventManager(UUID eventId, UUID userIdToRemove, UUID currentUserId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Sự kiện không tồn tại"));
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Người dùng không hợp lệ"));

        if (!checkCanManage(event, currentUser)) {
            throw new RuntimeException("Bạn không có quyền xóa quản lý của sự kiện này");
        }

        EventManager em = eventManagerRepository.findByEventIdAndUserId(eventId, userIdToRemove)
                .orElseThrow(() -> new RuntimeException("Người dùng không phải là quản lý của sự kiện này"));

        eventManagerRepository.delete(em);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminRegistrationResponse> getEventRegistrationsForManager(UUID eventId, UUID currentUserId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Sự kiện không tồn tại"));
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Người dùng không hợp lệ"));

        if (!checkCanManage(event, currentUser)) {
            throw new RuntimeException("Bạn không có quyền xem danh sách đăng ký của sự kiện này");
        }

        return adminRegistrationService.getEventRegistrations(eventId);
    }

    @Override
    @Transactional
    public MessageResponse manualCheckInForManager(UUID registrationId, UUID currentUserId) {
        Registration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Phiếu đăng ký không tồn tại"));
        Event event = reg.getEvent();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Người dùng không hợp lệ"));

        if (!checkCanManage(event, currentUser)) {
            throw new RuntimeException("Bạn không có quyền điểm danh cho sự kiện này");
        }

        return adminRegistrationService.manualCheckIn(registrationId);
    }

    @Override
    @Transactional
    public MessageResponse cancelCheckInForManager(UUID registrationId, UUID currentUserId) {
        Registration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Phiếu đăng ký không tồn tại"));
        Event event = reg.getEvent();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Người dùng không hợp lệ"));

        if (!checkCanManage(event, currentUser)) {
            throw new RuntimeException("Bạn không có quyền hủy điểm danh cho sự kiện này");
        }

        return adminRegistrationService.cancelCheckIn(registrationId);
    }
}
