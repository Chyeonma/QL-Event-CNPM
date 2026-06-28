package com.project.event.service.impl;

import com.project.event.dto.*;
import com.project.event.entity.*;
import com.project.event.repository.*;
import com.project.event.service.PublicEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicEventServiceImpl implements PublicEventService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final EventManagerRepository eventManagerRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PublicEventResponse> getPublishedEvents(String keyword, UUID currentUserId) {
        List<Event> events;
        if (keyword != null && !keyword.trim().isEmpty()) {
            events = eventRepository.searchEventsByStatusNot("DRAFT", keyword.trim());
        } else {
            events = eventRepository.findByStatusNotOrderByStartTimeDesc("DRAFT");
        }

        return events.stream()
                .map(e -> mapToPublicResponse(e, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PublicEventResponse getEventDetail(UUID eventId, UUID currentUserId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Sự kiện không tồn tại"));
        if ("DRAFT".equals(event.getStatus())) {
            throw new RuntimeException("Sự kiện chưa được công bố");
        }
        return mapToPublicResponse(event, currentUserId);
    }

    @Override
    @Transactional
    public MessageResponse registerEvent(UUID eventId, UUID studentId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Sự kiện không tồn tại"));
        if ("CLOSED".equals(event.getStatus())) {
            throw new RuntimeException("Sự kiện này đã kết thúc, không thể tiếp nhận vé đăng ký mới!");
        }
        if (!"PUBLISHED".equals(event.getStatus())) {
            throw new RuntimeException("Sự kiện chưa mở đăng ký");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        // Kiểm tra số lượng đã đăng ký
        long regCount = registrationRepository.countByEventIdAndStatus(eventId, "REGISTERED");
        if (regCount >= event.getCapacity()) {
            throw new RuntimeException("Sự kiện đã hết chỗ trống");
        }

        // Kiểm tra xem đã đăng ký trước đó chưa
        Optional<Registration> existingOpt = registrationRepository.findByEventIdAndStudentId(eventId, studentId);
        if (existingOpt.isPresent()) {
            Registration existing = existingOpt.get();
            if ("REGISTERED".equals(existing.getStatus())) {
                throw new RuntimeException("Bạn đã đăng ký tham gia sự kiện này rồi");
            } else {
                // Đã từng hủy trước đó -> khôi phục lại
                existing.setStatus("REGISTERED");
                existing.setCheckedInAt(null);
                registrationRepository.save(existing);
                return new MessageResponse("Đăng ký tham gia sự kiện thành công");
            }
        }

        Registration reg = Registration.builder()
                .event(event)
                .student(student)
                .status("REGISTERED")
                .build();
        registrationRepository.save(reg);

        return new MessageResponse("Đăng ký tham gia sự kiện thành công");
    }

    @Override
    @Transactional
    public MessageResponse cancelRegistration(UUID eventId, UUID studentId) {
        Registration reg = registrationRepository.findByEventIdAndStudentId(eventId, studentId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa đăng ký sự kiện này"));

        if ("CLOSED".equals(reg.getEvent().getStatus())) {
            throw new RuntimeException("Sự kiện đã khép lại, không thể hủy vé!");
        }

        if ("CANCELLED".equals(reg.getStatus())) {
            throw new RuntimeException("Bạn đã hủy đăng ký sự kiện này trước đó");
        }

        reg.setStatus("CANCELLED");
        registrationRepository.save(reg);
        return new MessageResponse("Hủy đăng ký sự kiện thành công");
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentRegistrationResponse> getMyRegistrations(UUID studentId) {
        List<Registration> regs = registrationRepository.findByStudentIdOrderByRegisteredAtDesc(studentId);
        return regs.stream()
                .filter(r -> !"CANCELLED".equals(r.getStatus()))
                .map(r -> StudentRegistrationResponse.builder()
                        .id(r.getId())
                        .eventId(r.getEvent().getId())
                        .eventTitle(r.getEvent().getTitle())
                        .location(r.getEvent().getLocation())
                        .startTime(r.getEvent().getStartTime())
                        .endTime(r.getEvent().getEndTime())
                        .trainingPoints(r.getEvent().getTrainingPoints())
                        .status(r.getStatus())
                        .registeredAt(r.getRegisteredAt())
                        .checkedInAt(r.getCheckedInAt())
                        .description(r.getEvent().getDescription())
                        .organizerName(r.getEvent().getCreatedBy() != null ? r.getEvent().getCreatedBy().getFullName() : "Đoàn Thanh Niên PTIT")
                        .eventStatus(r.getEvent().getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageResponse checkInEvent(UUID eventId, UUID studentId) {
        Registration reg = registrationRepository.findByEventIdAndStudentId(eventId, studentId)
                .orElseThrow(() -> new RuntimeException("Sinh viên chưa đăng ký sự kiện này"));

        if ("CANCELLED".equals(reg.getStatus())) {
            throw new RuntimeException("Đăng ký đã bị hủy trước đó");
        }

        if (reg.getCheckedInAt() != null) {
            throw new RuntimeException("Sinh viên đã được điểm danh rồi");
        }

        reg.setCheckedInAt(LocalDateTime.now());
        registrationRepository.save(reg);
        return new MessageResponse("Điểm danh sự kiện thành công");
    }

    private PublicEventResponse mapToPublicResponse(Event event, UUID currentUserId) {
        long regCount = registrationRepository.countByEventIdAndStatus(event.getId(), "REGISTERED");
        
        boolean isReg = false;
        String userStatus = "NONE";
        boolean isMgr = false;

        if (currentUserId != null) {
            Optional<Registration> regOpt = registrationRepository.findByEventIdAndStudentId(event.getId(), currentUserId);
            if (regOpt.isPresent()) {
                Registration r = regOpt.get();
                userStatus = r.getStatus();
                if ("REGISTERED".equals(userStatus)) {
                    isReg = true;
                    if (r.getCheckedInAt() != null) {
                        userStatus = "CHECKED_IN";
                    }
                }
            }
            
            User currentUser = userRepository.findById(currentUserId).orElse(null);
            if (currentUser != null) {
                if ("ADMIN".equals(currentUser.getRole())) {
                    isMgr = true;
                } else if (event.getCreatedBy() != null && event.getCreatedBy().getId().equals(currentUserId)) {
                    isMgr = true;
                } else if (eventManagerRepository.existsByEventIdAndUserId(event.getId(), currentUserId)) {
                    isMgr = true;
                }
            }
        }

        List<EventTargetDto> targetDtos = event.getTargets().stream()
                .map(t -> new EventTargetDto(t.getBatch(), t.getMajor()))
                .collect(Collectors.toList());

        List<EventImageDto> imageDtos = event.getImages().stream()
                .map(img -> new EventImageDto(img.getId(), img.getImageUrl(), img.getDisplayOrder()))
                .collect(Collectors.toList());

        return PublicEventResponse.builder()
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
                .registeredCount(regCount)
                .isRegistered(isReg)
                .userRegistrationStatus(userStatus)
                .isManager(isMgr)
                .targets(targetDtos)
                .images(imageDtos)
                .build();
    }
}
