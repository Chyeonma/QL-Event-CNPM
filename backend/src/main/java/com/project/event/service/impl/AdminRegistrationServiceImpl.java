package com.project.event.service.impl;

import com.project.event.dto.AdminRegistrationResponse;
import com.project.event.dto.MessageResponse;
import com.project.event.entity.Registration;
import com.project.event.entity.User;
import com.project.event.repository.RegistrationRepository;
import com.project.event.service.AdminRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminRegistrationServiceImpl implements AdminRegistrationService {

    private final RegistrationRepository registrationRepository;

    private AdminRegistrationResponse mapToDto(Registration reg) {
        User student = reg.getStudent();
        return AdminRegistrationResponse.builder()
                .id(reg.getId())
                .studentId(student != null ? student.getId() : null)
                .studentCode(student != null ? student.getStudentCode() : "N/A")
                .fullName(student != null ? student.getFullName() : "Khách")
                .classCode(student != null ? student.getClassCode() : "N/A")
                .email(student != null ? student.getEmail() : "N/A")
                .status(reg.getStatus())
                .registeredAt(reg.getRegisteredAt())
                .checkedInAt(reg.getCheckedInAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminRegistrationResponse> getEventRegistrations(UUID eventId) {
        return registrationRepository.findByEventIdOrderByRegisteredAtDesc(eventId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminRegistrationResponse> getAllRegistrations() {
        return registrationRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageResponse manualCheckIn(UUID registrationId) {
        Registration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Suất đăng ký không tồn tại"));

        if ("CANCELLED".equals(reg.getStatus())) {
            throw new RuntimeException("Không thể điểm danh cho suất đã bị hủy");
        }

        if (reg.getCheckedInAt() != null) {
            return new MessageResponse("Sinh viên này đã được điểm danh từ trước");
        }

        reg.setCheckedInAt(LocalDateTime.now());
        registrationRepository.save(reg);

        return new MessageResponse("Điểm danh thủ công thành công");
    }

    @Override
    @Transactional
    public MessageResponse cancelStudentRegistration(UUID registrationId) {
        Registration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Suất đăng ký không tồn tại"));

        reg.setStatus("CANCELLED");
        registrationRepository.save(reg);

        return new MessageResponse("Đã hủy suất đăng ký tham gia của sinh viên");
    }

    @Override
    @Transactional
    public MessageResponse cancelCheckIn(UUID registrationId) {
        Registration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Suất đăng ký không tồn tại"));

        reg.setCheckedInAt(null);
        registrationRepository.save(reg);

        return new MessageResponse("Đã hủy điểm danh của sinh viên");
    }
}
