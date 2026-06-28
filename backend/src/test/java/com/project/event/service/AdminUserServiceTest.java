package com.project.event.service;

import com.project.event.dto.AdminUserRequest;
import com.project.event.dto.AdminUserResponse;
import com.project.event.entity.User;
import com.project.event.repository.UserRepository;
import com.project.event.service.impl.AdminUserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminUserServiceImpl adminUserService;

    private User studentUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        studentUser = User.builder()
                .id(userId)
                .studentCode("B21DCCN001")
                .fullName("Nguyen Van A")
                .email("student@ptit.edu.vn")
                .classCode("D21CQCN01-B")
                .role("STUDENT")
                .passwordHash("$2a$10$hash")
                .requirePasswordChange(true)
                .isDeleted(false)
                .build();
    }

    // ==================== GET USERS ====================

    @Test
    @DisplayName("getUsersByRole - ALL returns all users")
    void getUsersByRole_all_returnsAll() {
        when(userRepository.findAll()).thenReturn(List.of(studentUser));

        List<AdminUserResponse> result = adminUserService.getUsersByRole("ALL");

        assertEquals(1, result.size());
        assertEquals("B21DCCN001", result.get(0).getStudentCode());
    }

    @Test
    @DisplayName("getUsersByRole - null role returns all users")
    void getUsersByRole_null_returnsAll() {
        when(userRepository.findAll()).thenReturn(List.of(studentUser));

        List<AdminUserResponse> result = adminUserService.getUsersByRole(null);

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("getUsersByRole - STUDENT filters by role")
    void getUsersByRole_student_filtersCorrectly() {
        when(userRepository.findByRole("STUDENT")).thenReturn(List.of(studentUser));

        List<AdminUserResponse> result = adminUserService.getUsersByRole("STUDENT");

        assertEquals(1, result.size());
        assertEquals("STUDENT", result.get(0).getRole());
    }

    @Test
    @DisplayName("getUserById - returns mapped response")
    void getUserById_found_returnsResponse() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(studentUser));

        AdminUserResponse response = adminUserService.getUserById(userId);

        assertNotNull(response);
        assertEquals(userId, response.getId());
        assertEquals("Nguyen Van A", response.getFullName());
        assertTrue(response.getHasPassword());
    }

    @Test
    @DisplayName("getUserById - not found throws RuntimeException")
    void getUserById_notFound_throws() {
        UUID unknownId = UUID.randomUUID();
        when(userRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> adminUserService.getUserById(unknownId));
    }

    // ==================== CREATE USER ====================

    @Test
    @DisplayName("createUser - success creates new user with STUDENT role")
    void createUser_success() {
        AdminUserRequest req = new AdminUserRequest();
        req.setStudentCode("B21DCCN002");
        req.setFullName("Tran Thi B");
        req.setEmail("newstudent@ptit.edu.vn");
        req.setClassCode("D21CQCN01-B");
        req.setRole(null);

        when(userRepository.existsByEmail("newstudent@ptit.edu.vn")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        AdminUserResponse response = adminUserService.createUser(req);

        assertNotNull(response);
        assertEquals("STUDENT", response.getRole());
        assertTrue(response.getRequirePasswordChange());
        assertFalse(response.getIsDeleted());
    }

    @Test
    @DisplayName("createUser - duplicate email throws RuntimeException")
    void createUser_duplicateEmail_throws() {
        AdminUserRequest req = new AdminUserRequest();
        req.setEmail("student@ptit.edu.vn");

        when(userRepository.existsByEmail("student@ptit.edu.vn")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> adminUserService.createUser(req));
        assertTrue(ex.getMessage().contains("Email đã tồn tại"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("createUser - sets role from request when provided")
    void createUser_withRole_setsCorrectRole() {
        AdminUserRequest req = new AdminUserRequest();
        req.setStudentCode("B21DCCN003");
        req.setFullName("Le Van C");
        req.setEmail("manager@ptit.edu.vn");
        req.setRole("MANAGER");

        when(userRepository.existsByEmail("manager@ptit.edu.vn")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        AdminUserResponse response = adminUserService.createUser(req);

        assertEquals("MANAGER", response.getRole());
    }

    // ==================== UPDATE USER ====================

    @Test
    @DisplayName("updateUser - updates all fields including role")
    void updateUser_success() {
        AdminUserRequest req = new AdminUserRequest();
        req.setStudentCode("B21DCCN001");
        req.setFullName("Nguyen Van A Updated");
        req.setEmail("student@ptit.edu.vn");
        req.setClassCode("D21CQCN02-B");
        req.setRole("MANAGER");

        when(userRepository.findById(userId)).thenReturn(Optional.of(studentUser));
        when(userRepository.save(any(User.class))).thenReturn(studentUser);

        adminUserService.updateUser(userId, req);

        assertEquals("Nguyen Van A Updated", studentUser.getFullName());
        assertEquals("MANAGER", studentUser.getRole());
        assertEquals("D21CQCN02-B", studentUser.getClassCode());
    }

    @Test
    @DisplayName("updateUser - keeps existing role when request role is null")
    void updateUser_nullRole_keepsExistingRole() {
        AdminUserRequest req = new AdminUserRequest();
        req.setStudentCode("B21DCCN001");
        req.setFullName("Nguyen Van A");
        req.setEmail("student@ptit.edu.vn");
        req.setRole(null);

        when(userRepository.findById(userId)).thenReturn(Optional.of(studentUser));
        when(userRepository.save(any(User.class))).thenReturn(studentUser);

        adminUserService.updateUser(userId, req);

        assertEquals("STUDENT", studentUser.getRole());
    }

    @Test
    @DisplayName("updateUser - user not found throws RuntimeException")
    void updateUser_notFound_throws() {
        UUID unknownId = UUID.randomUUID();
        when(userRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> adminUserService.updateUser(unknownId, new AdminUserRequest()));
    }

    // ==================== LOCK / UNLOCK ====================

    @Test
    @DisplayName("lockUser - sets isDeleted = true")
    void lockUser_setsDeletedTrue() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(studentUser));
        when(userRepository.save(any(User.class))).thenReturn(studentUser);

        adminUserService.lockUser(userId);

        assertTrue(studentUser.getIsDeleted());
        verify(userRepository).save(studentUser);
    }

    @Test
    @DisplayName("lockUser - user not found throws RuntimeException")
    void lockUser_notFound_throws() {
        UUID unknownId = UUID.randomUUID();
        when(userRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> adminUserService.lockUser(unknownId));
    }

    @Test
    @DisplayName("unlockUser - sets isDeleted = false")
    void unlockUser_setsDeletedFalse() {
        studentUser.setIsDeleted(true);
        when(userRepository.findById(userId)).thenReturn(Optional.of(studentUser));
        when(userRepository.save(any(User.class))).thenReturn(studentUser);

        adminUserService.unlockUser(userId);

        assertFalse(studentUser.getIsDeleted());
    }

    // ==================== DELETE PERMANENT ====================

    @Test
    @DisplayName("deleteUserPermanently - calls repository delete")
    void deleteUserPermanently_success() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(studentUser));
        doNothing().when(userRepository).delete(studentUser);

        adminUserService.deleteUserPermanently(userId);

        verify(userRepository).delete(studentUser);
    }

    @Test
    @DisplayName("deleteUserPermanently - not found throws RuntimeException")
    void deleteUserPermanently_notFound_throws() {
        UUID unknownId = UUID.randomUUID();
        when(userRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> adminUserService.deleteUserPermanently(unknownId));
    }

    // ==================== ACTIVATE ====================

    @Test
    @DisplayName("activateUser - clears requirePasswordChange and isDeleted")
    void activateUser_success() {
        studentUser.setRequirePasswordChange(true);
        studentUser.setIsDeleted(true);
        when(userRepository.findById(userId)).thenReturn(Optional.of(studentUser));
        when(userRepository.save(any(User.class))).thenReturn(studentUser);

        adminUserService.activateUser(userId);

        assertFalse(studentUser.getRequirePasswordChange());
        assertFalse(studentUser.getIsDeleted());
    }

    // ==================== PROMOTE BY EMAIL ====================

    @Test
    @DisplayName("promoteUserByEmail - updates role successfully")
    void promoteUserByEmail_success() {
        when(userRepository.findByEmailIgnoreCaseAndIsDeletedFalse("student@ptit.edu.vn"))
                .thenReturn(Optional.of(studentUser));
        when(userRepository.save(any(User.class))).thenReturn(studentUser);

        adminUserService.promoteUserByEmail("student@ptit.edu.vn", "ADMIN");

        assertEquals("ADMIN", studentUser.getRole());
    }

    @Test
    @DisplayName("promoteUserByEmail - email not found throws RuntimeException")
    void promoteUserByEmail_emailNotFound_throws() {
        when(userRepository.findByEmailIgnoreCaseAndIsDeletedFalse("unknown@ptit.edu.vn"))
                .thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> adminUserService.promoteUserByEmail("unknown@ptit.edu.vn", "ADMIN"));
        assertTrue(ex.getMessage().contains("unknown@ptit.edu.vn"));
    }

    @Test
    @DisplayName("promoteUserByEmail - role is uppercased before saving")
    void promoteUserByEmail_roleIsUppercased() {
        when(userRepository.findByEmailIgnoreCaseAndIsDeletedFalse("student@ptit.edu.vn"))
                .thenReturn(Optional.of(studentUser));
        when(userRepository.save(any(User.class))).thenReturn(studentUser);

        adminUserService.promoteUserByEmail("student@ptit.edu.vn", "manager");

        assertEquals("MANAGER", studentUser.getRole());
    }

    // ==================== RESPONSE MAPPING ====================

    @Test
    @DisplayName("getUserById - hasPassword is false when passwordHash is null")
    void getUserById_noPassword_hasPasswordFalse() {
        studentUser.setPasswordHash(null);
        when(userRepository.findById(userId)).thenReturn(Optional.of(studentUser));

        AdminUserResponse response = adminUserService.getUserById(userId);

        assertFalse(response.getHasPassword());
    }
}
